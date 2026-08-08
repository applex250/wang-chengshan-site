---
layout: page
title: 研究プロジェクト
permalink: /projects/
description: 主導または統括した主要な科学研究プロジェクト。
nav: true
nav_order: 4
horizontal: false
languages: [ja]
---

<!-- pages/ja/projects.md：ホームページ風のテキストレイアウト（カードなし、.post の軽い書体を継承） -->
<div class="projects">
{% assign sorted_projects = site.projects | sort: "importance" %}
{% for project in sorted_projects %}
  <h2>
    {% if project.redirect == blank %}
      <a href="{{ project.url | relative_url }}">{{ project.title }}</a>
    {% elsif project.redirect contains '://' %}
      <a href="{{ project.redirect }}" target="_blank" rel="noopener noreferrer">{{ project.title }}</a>
    {% else %}
      <a href="{{ project.redirect | relative_url }}">{{ project.title }}</a>
    {% endif %}
  </h2>
  <p>{{ project.description }}</p>
{% endfor %}
</div>
