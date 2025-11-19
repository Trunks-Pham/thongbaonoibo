// ================== CHẶN DEVTOOLS MẠNH NHẤT 2025 ==================
(function () {
    'use strict';

    // 1. Chặn phím tắt phổ biến
    document.addEventListener('keydown', function (e) {
        if (
            e.keyCode == 123 || // F12
            (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) || // Ctrl+Shift+I/J/C
            (e.ctrlKey && e.keyCode == 85) || // Ctrl+U
            (e.ctrlKey && e.shiftKey && e.keyCode == 75) || // Ctrl+Shift+K (Firefox)
            (e.metaKey && e.altKey && (e.keyCode == 73 || e.keyCode == 74)) // Cmd+Option+I/J (Mac)
        ) {
            e.preventDefault();
            e.stopPropagation();
            alert('DevTools bị chặn trên hệ thống này!');
            return false;
        }
    }, true);

    // 2. Chặn menu chuột phải
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        // Có thể thêm thông báo nhẹ
        // alert('Chuột phải bị vô hiệu hóa');
        return false;
    });

    // 3. Phát hiện khi DevTools được mở (theo kích thước hoặc debugger)
    const devtoolsDetect = () => {
        const threshold = 160;
        if (
            window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold
        ) {
            // DevTools đang mở → làm gì đó phá hoại
            document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#c0392b;color:white;display:flex;align-items:center;justify-content:center;font-size:2rem;z-index:99999;">DevTools bị cấm!<br>Hệ thống sẽ tự đóng trong 3 giây...</div>';
            setTimeout(() => window.location.href = 'about:blank', 3000);
        }

        // Phát hiện bằng debugger loop (rất khó bypass)
        const start = performance.now();
        debugger;
        if (performance.now() - start > 100) {
            document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:50vh;">Trình duyệt của bạn đang ở chế độ debug. Vui lòng tắt DevTools.</h1>';
            setInterval(() => { debugger; }, 100);
        }
    };

    // Chạy liên tục
    setInterval(devtoolsDetect, 500);

    // 4. Chặn các cách mở DevTools khác (Elements panel, console.log, v.v.)
    (function () {
        const originalLog = console.log;
        console.log = function () {
            document.body.innerHTML = '<div style="background:#e74c3c;color:white;padding:50px;text-align:center;font-size:2rem;">Console bị cấm!</div>';
            setTimeout(() => window.top.location.href = 'about:blank', 1000);
        };
    })();

    // 5. Tự phá trang nếu bị inspect element
    let checkInspect = setInterval(() => {
        const check = document.createElement('div');
        check.__defineGetter__('id', function () {
            document.body.innerHTML = '<h1 style="color:red;">Không được inspect element!</h1>';
            clearInterval(checkInspect);
            setTimeout(() => window.location.reload(), 1000);
        });
        console.log(check);
    }, 200);

    // 6. Chặn kéo thả file, copy toàn bộ trang
    document.onselectstart = () => false;
    document.ondragstart = () => false;

})();