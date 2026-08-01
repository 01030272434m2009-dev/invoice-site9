self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 

    const action = event.action;

    // 1. معالجة فتح اللوحة ومنح جلسة الـ 15 دقيقة
    if (action === 'open_app_real' || action === '' || !action) {
        const expiryTime = new Date().getTime() + (15 * 60 * 1000); // 15 دقيقة من الآن
        const targetUrl = new URL('./', self.location.href).href + `?session_expiry=${expiryTime}`;

        const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(windowClients) {
                // إذا كانت الصفحة مفتوحة، قم بالتركيز عليها وإرسال وقت الانتهاء
                for (let i = 0; i < windowClients.length; i++) {
                    let client = windowClients[i];
                    if ('focus' in client) {
                        client.postMessage({ type: 'SET_SESSION_EXPIRY', expiry: expiryTime });
                        return client.focus();
                    }
                }
                // إذا لم تكن مفتوحة، افتح نافذة جديدة بالرابط المحدث
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            });

        event.waitUntil(promiseChain);
    }

    // 2. حفظ التوثيقات السريعة وإظهار إشعار تأكيد + إبلاغ الواجهة
    if (action === 'record_500' || action === 'record_300') {
        let scoreValue = (action === 'record_500') ? 500 : 300;

        const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(windowClients) {
                // إبلاغ الصفحات المفتوحة بقيمة التوثيق الجديدة فوراً
                windowClients.forEach(client => {
                    client.postMessage({ type: 'RECORD_SCORE', amount: scoreValue });
                });

                // إظهار إشعار التأكيد
                return self.registration.showNotification("✅ تم التوثيق بنجاح", {
                    body: `تم رصد وتسجيل فئة ${scoreValue} بنجاح.`,
                    icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
                    tag: "confirmation-tag"
                });
            });

        event.waitUntil(promiseChain);
    }
});
