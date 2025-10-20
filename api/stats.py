import pandas as pd
import numpy as np
from scipy import stats as scipy_stats
from typing import Dict, Any, Optional
from supabase import Client

class ExperimentStats:
    """Statistical analysis for A/B testing experiments"""
    
    def __init__(self, supabase_client: Client, experiment_id: str):
        self.supabase = supabase_client
        self.experiment_id = experiment_id
        self.df = None
        
    def load_data(self) -> pd.DataFrame:
        """Load experiment data from Supabase into pandas DataFrame"""
        response = self.supabase.table("events").select("*").eq("experiment_id", self.experiment_id).execute()
        
        if not response.data or len(response.data) == 0:
            return pd.DataFrame()
        
        self.df = pd.DataFrame(response.data)
        
        # Type conversions
        self.df['converted'] = self.df['converted'].astype(bool)
        self.df['completion_time'] = pd.to_numeric(self.df['completion_time'], errors='coerce')
        self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
        
        return self.df
    
    def get_variant_metrics(self, variant: str) -> Dict[str, Any]:
        """Calculate comprehensive metrics for a single variant"""
        if self.df is None or len(self.df) == 0:
            return {}
        
        variant_df = self.df[self.df['variant'] == variant]
        
        # Basic counts
        total_users = len(variant_df)
        started = len(variant_df[variant_df['action_type'] == 'started'])
        completed = len(variant_df[variant_df['action_type'] == 'completed'])
        repeated = len(variant_df[variant_df['action_type'] == 'repeated'])
        conversions = int(variant_df['converted'].sum())
        
        # Completion times (only for successful completions)
        completed_df = variant_df[
            (variant_df['action_type'] == 'completed') & 
            (variant_df['success'] == True)
        ]
        
        completion_times = completed_df['completion_time'].dropna()
        
        metrics = {
            'n_users': int(total_users),
            'n_started': int(started),
            'n_completed': int(completed),
            'n_repeated': int(repeated),
            'conversions': int(conversions),
            'conversion_rate': float(conversions / total_users) if total_users > 0 else 0,
            'completion_rate': float(completed / started * 100) if started > 0 else 0,
            'repeat_rate': float(repeated / completed * 100) if completed > 0 else 0,
        }
        
        # Time statistics
        if len(completion_times) > 0:
            metrics['time_stats'] = {
                'mean': float(completion_times.mean()),
                'median': float(completion_times.median()),
                'std': float(completion_times.std()),
                'min': float(completion_times.min()),
                'max': float(completion_times.max()),
                'q25': float(completion_times.quantile(0.25)),
                'q75': float(completion_times.quantile(0.75)),
                'n_samples': int(len(completion_times))
            }
            
            # Confidence interval for mean (95%)
            if len(completion_times) > 1:
                ci = scipy_stats.t.interval(
                    0.95,
                    len(completion_times) - 1,
                    loc=completion_times.mean(),
                    scale=scipy_stats.sem(completion_times)
                )
                metrics['time_stats']['ci_lower'] = float(ci[0])
                metrics['time_stats']['ci_upper'] = float(ci[1])
        else:
            metrics['time_stats'] = None
        
        return metrics
    
    def compare_variants(self) -> Dict[str, Any]:
        """Compare variants A and B with statistical tests"""
        if self.df is None or len(self.df) == 0:
            return {'error': 'No data available'}
        
        a_metrics = self.get_variant_metrics('A')
        b_metrics = self.get_variant_metrics('B')
        
        if not a_metrics or not b_metrics:
            return {'error': 'Need data from both variants'}
        
        comparison = {
            'variant_a': a_metrics,
            'variant_b': b_metrics,
            'statistical_tests': {}
        }
        
        # T-test for completion times
        if (a_metrics.get('time_stats') and b_metrics.get('time_stats') and
            a_metrics['time_stats']['n_samples'] > 1 and b_metrics['time_stats']['n_samples'] > 1):
            
            a_times = self.df[
                (self.df['variant'] == 'A') & 
                (self.df['action_type'] == 'completed') & 
                (self.df['success'] == True)
            ]['completion_time'].dropna()
            
            b_times = self.df[
                (self.df['variant'] == 'B') & 
                (self.df['action_type'] == 'completed') & 
                (self.df['success'] == True)
            ]['completion_time'].dropna()
            
            t_stat, p_value = scipy_stats.ttest_ind(a_times, b_times)
            
            # Cohen's d effect size
            pooled_std = np.sqrt(
                ((len(a_times) - 1) * a_times.std()**2 + 
                 (len(b_times) - 1) * b_times.std()**2) / 
                (len(a_times) + len(b_times) - 2)
            )
            cohens_d = (a_times.mean() - b_times.mean()) / pooled_std if pooled_std > 0 else 0
            
            comparison['statistical_tests']['completion_time'] = {
                't_statistic': float(t_stat),
                'p_value': float(p_value),
                'significant': bool(p_value < 0.05),
                'cohens_d': float(cohens_d),
                'effect_size': self._interpret_cohens_d(cohens_d),
                'mean_difference': float(a_times.mean() - b_times.mean())
            }
        
        # Chi-square test for success rates
        a_success = int(((self.df['variant'] == 'A') & (self.df['converted'] == True)).sum())
        a_total = int((self.df['variant'] == 'A').sum())
        b_success = int(((self.df['variant'] == 'B') & (self.df['converted'] == True)).sum())
        b_total = int((self.df['variant'] == 'B').sum())
        
        if (a_total >= 5 and b_total >= 5 and 
            a_success > 0 and b_success > 0 and
            (a_total - a_success) > 0 and (b_total - b_success) > 0):
            
            contingency = [[a_success, a_total - a_success],
                          [b_success, b_total - b_success]]
            chi2, p_value, dof, expected = scipy_stats.chi2_contingency(contingency)
            
            comparison['statistical_tests']['success_rate'] = {
                'chi2_statistic': float(chi2),
                'p_value': float(p_value),
                'significant': bool(p_value < 0.05),
                'degrees_of_freedom': int(dof)
            }
        
        return comparison
    
    def _interpret_cohens_d(self, d: float) -> str:
        """Interpret Cohen's d effect size"""
        d_abs = abs(d)
        if d_abs < 0.2:
            return 'negligible'
        elif d_abs < 0.5:
            return 'small'
        elif d_abs < 0.8:
            return 'medium'
        else:
            return 'large'
        
    def calculate_user_percentile(self, user_time: float, variant: str) -> Dict[str, Any]:
        """Calculate user's percentile rank within their variant and overall"""
        if self.df is None or len(self.df) == 0:
            return {}
        
        # Get all successful completion times for the variant
        variant_times = self.df[
            (self.df['variant'] == variant) & 
            (self.df['action_type'] == 'completed') & 
            (self.df['success'] == True)
        ]['completion_time'].dropna()
        
        if len(variant_times) == 0:
            return {}
        
        # Calculate percentile (lower time = better = higher percentile)
        # We want "faster than X% of players"
        percentile = scipy_stats.percentileofscore(variant_times, user_time, kind='rank')
        # Invert because lower time is better
        percentile_rank = 100 - percentile
        
        # Overall percentile across both variants
        all_times = self.df[
            (self.df['action_type'] == 'completed') & 
            (self.df['success'] == True)
        ]['completion_time'].dropna()
        
        overall_percentile = 100 - scipy_stats.percentileofscore(all_times, user_time, kind='rank')
        
        return {
            'user_time': float(user_time),
            'variant': variant,
            'variant_percentile': round(float(percentile_rank), 1),
            'overall_percentile': round(float(overall_percentile), 1),
            'faster_than_variant': f"{round(percentile_rank, 1)}% of {variant} players",
            'faster_than_overall': f"{round(overall_percentile, 1)}% of all players"
        }
    
    def calculate_difficulty_comparison(self) -> Dict[str, Any]:
        """Calculate relative difficulty between variants"""
        if self.df is None or len(self.df) == 0:
            return {}
        
        a_metrics = self.get_variant_metrics('A')
        b_metrics = self.get_variant_metrics('B')
        
        if not (a_metrics.get('time_stats') and b_metrics.get('time_stats')):
            return {}
        
        a_mean = a_metrics['time_stats']['mean']
        b_mean = b_metrics['time_stats']['mean']
        
        # Calculate relative difficulty
        if a_mean > 0:
            difficulty_ratio = b_mean / a_mean
            percent_harder = (difficulty_ratio - 1) * 100
            
            # Determine which is harder
            if abs(percent_harder) < 5:
                difficulty_label = "similar difficulty"
            elif percent_harder > 0:
                difficulty_label = f"Variant B is {abs(percent_harder):.1f}% harder"
            else:
                difficulty_label = f"Variant A is {abs(percent_harder):.1f}% harder"
        else:
            difficulty_ratio = None
            percent_harder = None
            difficulty_label = "Unable to compare"
        
        # Success rate comparison
        a_success_rate = a_metrics['conversion_rate'] * 100
        b_success_rate = b_metrics['conversion_rate'] * 100
        success_diff = b_success_rate - a_success_rate
        
        return {
            'variant_a_avg_time': round(a_mean, 2),
            'variant_b_avg_time': round(b_mean, 2),
            'difficulty_ratio': round(float(difficulty_ratio), 3) if difficulty_ratio else None,
            'percent_harder': round(float(percent_harder), 1) if percent_harder else None,
            'difficulty_label': difficulty_label,
            'variant_a_success_rate': round(a_success_rate, 1),
            'variant_b_success_rate': round(b_success_rate, 1),
            'success_rate_difference': round(success_diff, 1)
        }
    
    def get_complete_analysis(self) -> Dict[str, Any]:
        """Get complete statistical analysis in one call"""
        self.load_data()
        
        if self.df is None or len(self.df) == 0:
            return {'status': 'error', 'message': 'No data available'}
        
        comparison = self.compare_variants()
        difficulty = self.calculate_difficulty_comparison()
        
        return {
            'status': 'success',
            'variant_a': comparison.get('variant_a', {}),
            'variant_b': comparison.get('variant_b', {}),
            'statistical_tests': comparison.get('statistical_tests', {}),
            'difficulty_analysis': difficulty,
            'sample_size': int(len(self.df)),
            'date_range': {
                'start': str(self.df['timestamp'].min()),
                'end': str(self.df['timestamp'].max())
            }
        }