// ================== CHẶN DEVTOOLS SIÊU CỨNG CHO NỘI BỘ – CÓ Ctrl+F & Ctrl+P BỊ CHẶN ==================
(function () {
    'use strict';

    // === CHỐT AN TOÀN DÀNH RIÊNG CHO BẠN (admin) ===
    if (location.search.includes('unlock=bonhacconnay')) {
        console.log('%cĐÃ MỞ KHÓA TOÀN BỘ (admin mode)', 'color:#27ae60;font-size:20px');
        return; // không chặn gì cả
    }

    // ================== CHẶN PHÍM TẮT ==================
    document.addEventListener('keydown', function (e) {
        const ctrl = e.ctrlKey || e.metaKey; // Ctrl hoặc Cmd (Mac)

        // Các tổ hợp bị cấm hoàn toàn
        const blocked =
            e.keyCode === 123 ||                                            // F12
            (ctrl && e.shiftKey && (e.keyCode === 73) ||   // Ctrl+Shift+I
                (ctrl && e.shiftKey && e.keyCode === 74) ||   // Ctrl+Shift+J
                (ctrl && e.shiftKey && e.keyCode === 67) ||   // Ctrl+Shift+C
                (ctrl && e.shiftKey && e.keyCode === 75) ||   // Ctrl+Shift+K (Firefox)
                (ctrl && e.keyCode === 85) ||                 // Ctrl+U (view source)
                (ctrl && e.keyCode === 70) ||                 // Ctrl+F  ← tìm kiếm
                (ctrl && e.keyCode === 80) ||                 // Ctrl+P  ← in trang
                (ctrl && e.keyCode === 65) ||                 // Ctrl+A (chọn hết – kết hợp với chặn select bên dưới)
                (ctrl && e.keyCode === 83) ||                 // Ctrl+S (save page)
                (ctrl && e.shiftKey && e.keyCode === 80));     // Ctrl+Shift+P (DevTools command menu)

        if (blocked) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }, true);

    // ================== CHẶN HOÀN TOÀN VIỆC CHỌN & COPY ==================
    document.onselectstart = () => false;   // không chọn được chữ
    document.oncontextmenu = () => false;  // chuột phải
    document.ondragstart = () => false;  // không kéo thả
    document.onkeydown = () => {       // chặn thêm Ctrl+C, Ctrl+X khi lỡ tay
        if ((e.ctrlKey || e.metaKey) && (e.keyCode === 67 || e.keyCode === 88 || e.keyCode === 86)) {
            e.preventDefault();
        }
    };

    // ================== PHÁT HIỆN DEVTOOLS MỞ BẰNG KÍCH THƯỚC ==================
    setInterval(() => {
        if (window.outerWidth - window.innerWidth > 350 ||
            window.outerHeight - window.innerHeight > 350) {
            document.documentElement.innerHTML = `<div style="position:fixed;inset:0;background:#c0392b;color:#fff;z-index:999999;display:grid;place-items:center;text-align:center;font-size:1.6rem;padding:20px;">
                <div><h2>DevTools bị cấm sử dụng</h2><p>Vui lòng đóng cửa sổ Developer Tools để tiếp tục.</p></div>
            </div>`;
        }
    }, 1000);

    // ================== DEBUGGER TRAP NHẸ NHƯNG KHÔNG THỂ BỎ QUA ==================
    let warned = false;
    setInterval(() => {
        const t = Date.now();
        debugger;
        if (Date.now() - t > 150 && !warned) {
            warned = true;
            document.documentElement.innerHTML = `<div style="position:fixed;inset:0;background:#e74c3c;color:#fff;z-index:999999;display:grid;place-items:center;text-align:center;font-size:1.7rem;">
                <div><h2>Không được bật DevTools</h2><p>Hệ thống nội bộ không cho phép chế độ lập trình viên.</p></div>
            </div>`;
        }
    }, 1800);

})();