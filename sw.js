self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 

    const action = event.action;

    // 1. معالجة فتح اللوحة ومنح جلسة الـ 15 دقيقة
    if (action === 'open_app_real' || action === '' || !action) {
        const expiryTime = new Date().getTime() + (15 * 60 * 1000); // 15 دقيقة من الآن

        const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(windowClients) {
                // إذا كانت الصفحة مفتوحة بالكامل، قم بالتركيز عليها وإرسال وقت الانتهاء
                for (let i = 0; i < windowClients.length; i++) {
                    let client = windowClients[i];
                    if ('focus' in client) {
                        client.postMessage({ type: 'SET_SESSION_EXPIRY', expiry: expiryTime });
                        return client.focus();
                    }
                }
                // إذا لم تكن مفتوحة، افتح نافذة جديدة مع إضافة المنسوب بالنواة (URL Params)
                if (clients.openWindow) {
                    return clients.openWindow(`./?session_expiry=${expiryTime}`);
                }
            });

        event.waitUntil(promiseChain);
    }

    // 2. حفظ التوثيقات السريعة وإظهار إشعار تأكيد
    if (action === 'record_500' || action === 'record_300') {
        let scoreValue = (action === 'record_500') ? 500 : 300;

        const confirmNotification = self.registration.showNotification("✅ تم التوثيق بنجاح", {
            body: `تم رصد وتسجيل فئة ${scoreValue} في الذاكرة المشفرة بنجاح.`,
            icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
            tag: "confirmation-tag"
        });

        event.waitUntil(confirmNotification);
    }
});
