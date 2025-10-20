import plotly.graph_objects as go
import plotly.express as px
from typing import Dict, Any
import pandas as pd

class ExperimentVisualizations:
    """Generate Plotly visualizations for A/B testing experiments"""
    
    def __init__(self):
        # Color scheme for consistency
        self.colors = {
            'variant_a': '#27ae60',  # Green
            'variant_b': '#3498db',  # Blue
            'started': '#3498db',
            'completed': '#27ae60',
            'repeated': '#f39c12'
        }
    
    def create_funnel_chart(self, variant_a_data: Dict, variant_b_data: Dict) -> Dict[str, Any]:
        """
        Create interactive side-by-side funnel chart comparing variants
        
        Args:
            variant_a_data: Dict with keys: n_started, n_completed, n_repeated
            variant_b_data: Dict with keys: n_started, n_completed, n_repeated
        
        Returns:
            Plotly figure as JSON
        """
        # Prepare data
        stages = ['Started', 'Completed', 'Repeated']
        
        a_values = [
            variant_a_data.get('n_started', 0),
            variant_a_data.get('n_completed', 0),
            variant_a_data.get('n_repeated', 0)
        ]
        
        b_values = [
            variant_b_data.get('n_started', 0),
            variant_b_data.get('n_completed', 0),
            variant_b_data.get('n_repeated', 0)
        ]
        
        # Create figure with subplots (side by side)
        fig = go.Figure()
        
        # Variant A funnel
        fig.add_trace(go.Funnel(
            name='Variant A',
            y=stages,
            x=a_values,
            textinfo='value+percent initial',
            marker={
                'color': self.colors['variant_a'],
                'line': {'width': 2, 'color': 'white'}
            },
            connector={'line': {'color': self.colors['variant_a'], 'width': 2}},
            hovertemplate='<b>Variant A - %{y}</b><br>Count: %{x}<br>%{percentInitial}<extra></extra>'
        ))
        
        # Variant B funnel
        fig.add_trace(go.Funnel(
            name='Variant B',
            y=stages,
            x=b_values,
            textinfo='value+percent initial',
            marker={
                'color': self.colors['variant_b'],
                'line': {'width': 2, 'color': 'white'}
            },
            connector={'line': {'color': self.colors['variant_b'], 'width': 2}},
            hovertemplate='<b>Variant B - %{y}</b><br>Count: %{x}<br>%{percentInitial}<extra></extra>'
        ))
        
        # Update layout
        fig.update_layout(
            title={
                'text': 'User Funnel: Variant A vs B',
                'x': 0.5,
                'xanchor': 'center'
            },
            showlegend=True,
            height=400,
            margin=dict(l=20, r=20, t=60, b=20),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(size=12),
            hovermode='closest'
        )
        
        return fig.to_json()
    
    def create_time_distribution(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Create histogram showing completion time distribution by variant
        
        Args:
            df: DataFrame with columns: variant, completion_time, action_type, success
        
        Returns:
            Plotly figure as JSON
        """
        # Filter to only successful completions
        completed_df = df[
            (df['action_type'] == 'completed') & 
            (df['success'] == True)
        ].copy()
        
        if len(completed_df) == 0:
            # Return empty chart with message
            fig = go.Figure()
            fig.add_annotation(
                text="No completion data available yet",
                xref="paper", yref="paper",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=16, color="gray")
            )
            fig.update_layout(height=400)
            return fig.to_json()
        
        # Create overlaid histograms
        fig = go.Figure()
        
        # Variant A histogram
        a_times = completed_df[completed_df['variant'] == 'A']['completion_time'].dropna()
        if len(a_times) > 0:
            fig.add_trace(go.Histogram(
                x=a_times,
                name='Variant A',
                marker_color=self.colors['variant_a'],
                opacity=0.7,
                nbinsx=20,
                hovertemplate='<b>Variant A</b><br>Time: %{x:.2f}s<br>Count: %{y}<extra></extra>'
            ))
        
        # Variant B histogram
        b_times = completed_df[completed_df['variant'] == 'B']['completion_time'].dropna()
        if len(b_times) > 0:
            fig.add_trace(go.Histogram(
                x=b_times,
                name='Variant B',
                marker_color=self.colors['variant_b'],
                opacity=0.7,
                nbinsx=20,
                hovertemplate='<b>Variant B</b><br>Time: %{x:.2f}s<br>Count: %{y}<extra></extra>'
            ))
        
        # Add mean lines
        if len(a_times) > 0:
            fig.add_vline(
                x=a_times.mean(),
                line_dash="dash",
                line_color=self.colors['variant_a'],
                annotation_text=f"A avg: {a_times.mean():.2f}s",
                annotation_position="top"
            )
        
        if len(b_times) > 0:
            fig.add_vline(
                x=b_times.mean(),
                line_dash="dash",
                line_color=self.colors['variant_b'],
                annotation_text=f"B avg: {b_times.mean():.2f}s",
                annotation_position="top"
            )
        
        # Update layout
        fig.update_layout(
            title={
                'text': 'Completion Time Distribution',
                'x': 0.5,
                'xanchor': 'center'
            },
            xaxis_title='Completion Time (seconds)',
            yaxis_title='Count',
            barmode='overlay',
            showlegend=True,
            height=400,
            margin=dict(l=40, r=20, t=60, b=40),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(size=12),
            hovermode='closest'
        )
        
        return fig.to_json()
    
    def create_success_rate_comparison(self, variant_a_data: Dict, variant_b_data: Dict) -> Dict[str, Any]:
        """
        Create bar chart comparing success rates with confidence intervals
        
        Args:
            variant_a_data: Dict with keys: conversion_rate, time_stats (with ci_lower, ci_upper)
            variant_b_data: Dict with keys: conversion_rate, time_stats (with ci_lower, ci_upper)
        
        Returns:
            Plotly figure as JSON
        """
        variants = ['Variant A', 'Variant B']
        success_rates = [
            variant_a_data.get('conversion_rate', 0) * 100,
            variant_b_data.get('conversion_rate', 0) * 100
        ]
        
        # Create bar chart
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            x=variants,
            y=success_rates,
            marker_color=[self.colors['variant_a'], self.colors['variant_b']],
            text=[f"{rate:.1f}%" for rate in success_rates],
            textposition='outside',
            hovertemplate='<b>%{x}</b><br>Success Rate: %{y:.1f}%<extra></extra>'
        ))
        
        # Update layout
        fig.update_layout(
            title={
                'text': 'Success Rate Comparison',
                'x': 0.5,
                'xanchor': 'center'
            },
            yaxis_title='Success Rate (%)',
            showlegend=False,
            height=350,
            margin=dict(l=40, r=20, t=60, b=40),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(size=12),
            yaxis=dict(range=[0, max(success_rates) * 1.2])
        )
        
        return fig.to_json()
    
    def create_avg_time_comparison(self, variant_a_data: Dict, variant_b_data: Dict) -> Dict[str, Any]:
        """
        Create bar chart comparing average completion times with confidence intervals
        
        Args:
            variant_a_data: Dict with time_stats containing mean, ci_lower, ci_upper
            variant_b_data: Dict with time_stats containing mean, ci_lower, ci_upper
        
        Returns:
            Plotly figure as JSON
        """
        a_stats = variant_a_data.get('time_stats', {})
        b_stats = variant_b_data.get('time_stats', {})
        
        if not a_stats or not b_stats:
            # Return empty chart
            fig = go.Figure()
            fig.add_annotation(
                text="Not enough data for comparison",
                xref="paper", yref="paper",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=16, color="gray")
            )
            fig.update_layout(height=350)
            return fig.to_json()
        
        variants = ['Variant A', 'Variant B']
        avg_times = [
            a_stats.get('mean', 0),
            b_stats.get('mean', 0)
        ]
        
        # Calculate error bars (distance from mean to CI bounds)
        error_lower = [
            a_stats.get('mean', 0) - a_stats.get('ci_lower', a_stats.get('mean', 0)),
            b_stats.get('mean', 0) - b_stats.get('ci_lower', b_stats.get('mean', 0))
        ]
        error_upper = [
            a_stats.get('ci_upper', a_stats.get('mean', 0)) - a_stats.get('mean', 0),
            b_stats.get('ci_upper', b_stats.get('mean', 0)) - b_stats.get('mean', 0)
        ]
        
        # Create bar chart with error bars
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            x=variants,
            y=avg_times,
            error_y=dict(
                type='data',
                symmetric=False,
                array=error_upper,
                arrayminus=error_lower
            ),
            marker_color=[self.colors['variant_a'], self.colors['variant_b']],
            text=[f"{time:.2f}s" for time in avg_times],
            textposition='outside',
            hovertemplate='<b>%{x}</b><br>Avg Time: %{y:.2f}s<br>95% CI shown<extra></extra>'
        ))
        
        # Update layout
        fig.update_layout(
            title={
                'text': 'Average Completion Time (with 95% CI)',
                'x': 0.5,
                'xanchor': 'center'
            },
            yaxis_title='Time (seconds)',
            showlegend=False,
            height=350,
            margin=dict(l=40, r=20, t=60, b=40),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(size=12),
            yaxis=dict(range=[0, max(avg_times) * 1.3])
        )
        
        return fig.to_json()