---
layout: page
title: 科研项目
permalink: /projects/
description: 牵头或主持的主要科学研究项目。
nav: true
nav_order: 4
horizontal: false
---

<!-- pages/projects.md：首页式正文排版（无卡片，继承 .post 轻盈字体） -->
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
