// ==UserScript==
// @name         GitHub Issue Note Taker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  快速将当前页面作为 Issue 发送到 GitHub
// @author       YourName
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    // 注册油猴菜单，点击后弹出窗口
    GM_registerMenuCommand("添加 GitHub 笔记", showNoteDialog);

    // 2. 注册快捷键 Option + S
    window.addEventListener('keydown', function(e) {
        if (e.altKey && (e.code === 'KeyS' || e.key === 's' || e.key === 'ß')) {
            e.preventDefault();
            e.stopPropagation(); // 阻止网页原有快捷键
            showNoteDialog();
        }
    }, true);

    function showNoteDialog() {
        // 配置信息 (保持原有)
        const t = 'token';
        const u = 'flied';
        const r = 'Daily_Read_1024';

        // 防止重复打开
        if (document.getElementById('github-note-wrapper')) return;

        // 创建 UI (保持原有样式和结构)
        const d = document.createElement('div');
        d.id = 'github-note-wrapper'; // 添加ID方便查找
        d.style = 'position:fixed;top:20%;left:50%;transform:translate(-50%,-50%);z-index:999999;padding:20px;background:#fff;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.2);font-family:sans-serif;width:500px;';
        d.innerHTML = '<h4 style="margin:0 0 10px;color:#333">添加笔记</h4><textarea id="nc" placeholder="输入评论..." style="width:100%;height:100px;margin-bottom:10px;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;resize:vertical;"></textarea><input id="nl" type="text" placeholder="标签 (#分割)" style="width:100%;margin-bottom:15px;padding:8px;box-sizing:border-box;border:1px solid #ccc;border-radius:4px;"><div style="text-align:right;"><button id="nx" style="margin-right:10px;padding:6px 15px;cursor:pointer;background:#f0f0f0;border:1px solid #ddd;border-radius:4px;">取消</button><button id="ns" style="padding:6px 20px;background:#2ea44f;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">发送</button></div>';
        document.body.appendChild(d);

        const k = () => d.remove();

        document.getElementById('nx').onclick = k;

        document.getElementById('ns').onclick = function() {
            const c = document.getElementById('nc').value;
            const l = document.getElementById('nl').value.split('#').map(s => s.trim()).filter(s => s !== '');
            const b = 'Title: ' + document.title + '\nURL: ' + window.location.href + '\n\nComment:\n' + c;
            // 关闭弹窗
            k();

            // 使用 GM_xmlhttpRequest 替代 fetch 进行跨域请求
            GM_xmlhttpRequest({
                method: "POST",
                url: 'https://api.github.com/repos/' + u + '/' + r + '/issues',
                headers: {
                    'Authorization': 'token ' + t,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    title: document.title,
                    body: b,
                    labels: l
                }),
                onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        // 成功，可以选择提示，也可以静默
                        console.log("GitHub Issue Created Successfully");
                    } else {
                        try {
                            const j = JSON.parse(response.responseText);
                            alert('Failed: ' + (j.message || 'Error'));
                        } catch (e) {
                            alert('Failed: ' + response.statusText);
                        }
                    }
                },
                onerror: function(e) {
                    alert('Error: Network Error');
                }
            });
        };
    }
})();
