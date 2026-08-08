#!/bin/bash
set -euo pipefail

echo "Entry point script running"

CONFIG_FILE=_config.yml
DOCKER_DESTINATION=/tmp/_site

# Function to manage Gemfile.lock
manage_gemfile_lock() {
    git config --global --add safe.directory /srv/jekyll
    if command -v git &> /dev/null && [ -f Gemfile.lock ]; then
        if git ls-files --error-unmatch Gemfile.lock &> /dev/null; then
            echo "Gemfile.lock is tracked by git, keeping it intact"
            git restore Gemfile.lock 2>/dev/null || true
        else
            echo "Gemfile.lock is not tracked by git, removing it"
            rm Gemfile.lock
        fi
    fi
}

ensure_bundle_deps() {
    if bundle check >/dev/null 2>&1; then
        echo "Bundler dependencies already satisfied"
        return
    fi

    echo "Installing missing bundler dependencies"
    bundle install --jobs 4 --retry 3
}

start_jekyll() {
    manage_gemfile_lock
    ensure_bundle_deps
    mkdir -p "$DOCKER_DESTINATION"
    # 2026-08-08: 移除 --livereload。Windows 宿主机 + Docker bind mount 下
    # --force_polling 会频繁误判文件变化 → 反复 rebuild → livereload 反复广播
    # 整页 reload,打断 swup 的 SPA 切换(点击导航"偶尔出错"、页面被刷新重置)。
    # 保留 --watch:文件变化仍会重建,swup fetch 到的是新内容,体验稳定。
    bundle exec jekyll serve --watch --port=8080 --host=0.0.0.0 --verbose --trace --force_polling --destination "$DOCKER_DESTINATION" --config "$CONFIG_FILE" &
}

start_jekyll

while true; do
    inotifywait -q -e modify,move,create,delete $CONFIG_FILE
    if [ $? -eq 0 ]; then
        echo "Change detected to $CONFIG_FILE, restarting Jekyll"
        jekyll_pid=$(pgrep -f jekyll)
        kill -KILL $jekyll_pid
        start_jekyll
    fi
done
