+++
title = 'Search'
type = 'blank'
indexable = false
+++

# Search

Search through posts, topics, and content on Science of Marketing Analytics.

<p class="hidden">It's necessary to enable Javascript</p>
<p class="search-loading hidden">Loading...</p>

<form id="search-form" class="search-form" action="#" method="post" accept-charset="UTF-8" role="search">
  <div class="search-bar">
    <label for="query" class="hidden">Search</label>
    <input id="query" class="search-text" type="text" placeholder="Search..."/>
  </div>
</form>

<div class="search-results"></div>

<template>
  <article class="search-result list-view">
    <header>
      <h2 class="title"><a href="#"></a></h2>
      <div class="submitted">
        <time class="created-date"></time>
      </div>
    </header>
    <p class="content"></p>
  </article>
</template>