---
layout: page
title: Research Projects
permalink: /projects/
description: Major scientific research projects led or directed by Prof. Wang.
nav: true
nav_order: 4
horizontal: false
languages: [en]
---

<!-- pages/en/projects.md: homepage-style text layout (no cards, inherits the lightweight .post font) -->
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
