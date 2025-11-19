// ================== CHẶN DEVTOOLS – PHIÊN BẢN DÀNH RIÊNG CHO PRODUCTION (ỔN ĐỊNH 100%) ==================
(function () {
    'use strict';

    // ============ CHỐT AN TOÀN CHO ADMIN (bạn thôi) ============
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('unlock') === 'NhanVienKhongBietCaiNay2025') {
        console.log('%c✅ Admin mode: DevTools đã được mở khóa!', 'color:green;font-size:18px');
        return; // Không chặn gì cả nếu có ?unlock=NhanVienKhongBietCaiNay2025
    }

    // ============ CHỈ CHẶN NHỮNG THỨ THẬT SỰ CẦN ============
    // 1. Chặn F12 + Ctrl+Shift+I/J/C + Ctrl+U
    document.onkeydown = function (e) {
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    // 2. Chặn chuột phải (nhẹ nhàng, không alert ồn ào)
    document.oncontextmenu = function (e) {
        e.preventDefault();
        return false;
    };

    // 3. Chặn chọn văn bản + kéo thả (ngăn copy nội dung dễ dàng)
    document.onselectstart = function () { return false; };
    document.ondragstart   = function () { return false; };

    // 4. Phát hiện DevTools mở theo kích thước (tăng threshold lên để tránh nhầm)
    setInterval(function () {
        if (window.outerHeight - window.innerHeight > 300 || 
            window.outerWidth - window.innerWidth > 300) {
            document.body.innerHTML = `
                <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#e74c3c;color:#fff;z-index:99999;
                           display:flex;align-items:center;justify-content:center;font-size:1.8rem;text-align:center;padding:20px;">
                    Trình duyệt của bạn đang ở chế độ Developer Tools.<br>
                    Vui lòng tắt DevTools để tiếp tục sử dụng hệ thống nội bộ.
                </div>`;
        }
    }, 800);

    // 5. Debugger trap nhẹ (không làm treo máy, chỉ hiện thông báo)
    setInterval(function () {
        const t0 = Date.now();
        debugger;
        if (Date.now() - t0 > 120) {
            document.body.innerHTML = `
                <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#c0392b;color:#fff;z-index:99999;
                           display:flex;align-items:center;justify-content:center;font-size:1.8rem;text-align:center;">
                    Vui lòng tắt chế độ Debug / DevTools để xem thông báo.<br><br>
                    Hệ thống nội bộ không cho phép sử dụng công cụ lập trình viên.
                </div>`;
        }
    }, 1500);

})();