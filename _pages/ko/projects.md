---
layout: page
title: 연구 프로젝트
permalink: /projects/
description: 직접 이끌거나 주관한 주요 과학 연구 프로젝트.
nav: true
nav_order: 4
horizontal: false
languages: [ko]
---

<!-- pages/ko/projects.md：홈페이지형 본문 레이아웃(카드 없음, .post 가벼운 글꼴 상속) -->
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
