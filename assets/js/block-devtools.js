// ================== CHẶN DEVTOOLS HOÀN HẢO – KHÔNG CHẶN Ctrl+F, Ctrl+P... ==================
(function () {
    'use strict';

    // === CHỐT AN TOÀN CHO BẠN (admin) ===
    if (location.search.includes('unlock=admin2025xyz')) {
        console.log('%c✅ Đã mở khóa DevTools (admin)', 'color:green;font-size:18px');
        return;
    }

    // === CHỈ CHẶN ĐÚNG NHỮNG PHÍM MUỐN CHẶN ===
    document.addEventListener('keydown', function (e) {
        // Chỉ chặn đúng các tổ hợp mở DevTools + View Source
        const isDevToolsShortcut = 
            e.keyCode === 123 ||                                                            // F12
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I / J / C
            (e.ctrlKey && e.shiftKey && e.keyCode === 75) ||                                // Ctrl+Shift+K (Firefox)
            (e.ctrlKey && e.keyCode === 85) ||                                              // Ctrl+U (view source)
            (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74));              // Cmd+Option+I/J (Mac)

        if (isDevToolsShortcut) {
            e.preventDefault();
            e.stopPropagation();
            // Không alert gì cả cho nó "êm", nhân viên chỉ thấy không mở được là xong
            return false;
        }

        // === KHÔNG chặn các phím bình thường người dùng hay dùng ===
        // Ctrl+F, Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+P, Ctrl+Z... vẫn hoạt động bình thường
    }, false); // dùng bubbling phase, không capture

    // Chặn chuột phải (nhẹ nhàng)
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Chặn chọn text + kéo thả (ngăn copy dễ dàng)
    document.onselectstart = () => false;
    document.ondragstart   = () => false;

    // Phát hiện DevTools mở bằng kích thước cửa sổ
    setInterval(() => {
        if (window.outerWidth - window.innerWidth > 350 || 
            window.outerHeight - window.innerHeight > 350) {
            document.documentElement.innerHTML = `
                <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#c0392b;color:#fff;z-index:999999;
                            display:flex;align-items:center;justify-content:center;text-align:center;font-size:1.6rem;padding:20px;">
                    <h2>DevTools bị cấm</h2>
                    <p>Vui lòng tắt cửa sổ Developer Tools để tiếp tục sử dụng hệ thống.</p>
                </div>`;
        }
    }, 1000);

    // Debugger trap nhẹ (chỉ hiện thông báo, không treo máy)
    let opened = false;
    setInterval(() => {
        const start = Date.now();
        debugger;
        if (Date.now() - start > 150 && !opened) {
            opened = true;
            document.documentElement.innerHTML = `
                <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#e74c3c;color:#fff;z-index:999999;
                            display:flex;align-items:center;justify-content:center;text-align:center;">
                    <h2>Không được sử dụng DevTools</h2>
                    <p>Hệ thống nội bộ không cho phép chế độ debug.</p>
                </div>`;
        }
    }, 2000);

})();