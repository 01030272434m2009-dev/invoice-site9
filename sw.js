// 🟢 1. الاستماع لكليك الإشعارات وتحديد الأكشن
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 

    const action = event.action;

    // 🟢 الحالة الأولى: فتح اللوحة وتفعيل جلسة الـ 15 دقيقة
    if (action === 'open_app_real' || action === '' || !action) {
        const expiryTime = new Date().getTime() + (15 * 60 * 1000); // 15 دقيقة
        const targetUrl = new URL('./', self.location.href).href + `?session_expiry=${expiryTime}`;

        const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(windowClients) {
                // إذا كانت الصفحة مفتوحة بالمتصفح، ركز عليها وأرسل وقت انتهاء الجلسة
                for (let i = 0; i < windowClients.length; i++) {
                    let client = windowClients[i];
                    if ('focus' in client) {
                        client.postMessage({ type: 'SET_SESSION_EXPIRY', expiry: expiryTime });
                        return client.focus();
                    }
                }
                // إذا كانت الصفحة مغلقة، افتحها برابط يحمل جلسة الانتهاء
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            });

        event.waitUntil(promiseChain);
    }

    // 🟢 الحالة الثانية: التوثيق المالي السريع (فئة 500 ج.م أو 300 ج.م) مباشرة من الإشعار
    if (action === 'record_500' || action === 'record_300') {
        const amountValue = (action === 'record_500') ? 500 : 300;

        const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(windowClients) {
                // 1. إرسال المبلغ المالي للصفحات المفتوحة فوراً
                windowClients.forEach(client => {
                    client.postMessage({ 
                        type: 'RECORD_FINANCIAL', 
                        amount: amountValue 
                    });
                });

                // 2. إظهار إشعار تأكيد التوثيق المالي
                return self.registration.showNotification("💰 تم تسجيل التوثيق المالي بنجاح", {
                    body: `تم تسجيل مبلغ ${amountValue} ج.م في تقريرك اليومي.`,
                    icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
                    tag: "confirmation-financial-tag"
                });
            });

        event.waitUntil(promiseChain);
    }
});
