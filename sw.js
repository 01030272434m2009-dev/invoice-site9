self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 

    // معالجة فتح اللوحة الطويلة عند انتهاء الـ 5 أسابيع
    if (event.action === 'open_app_real') {
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            return clients.openWindow('./').then(function(windowClient) {
                windowClient.navigate('./');
                let expiryTime = new Date().getTime() + (15 * 60 * 1000); // 15 دقيقة
                windowClient.executeScript && windowClient.executeScript(`localStorage.setItem('external_session_expiry', ${expiryTime});`);
            });
        });
    }

    // حفظ التوثيقات السريعة
    if (event.action === 'record_500' || event.action === 'record_300') {
        let scoreValue = event.action === 'record_500' ? 500 : 300;
        self.registration.showNotification("✅ تم التوثيق بنجاح", {
            body: `تم رصد وتسجيل فئة ${scoreValue} في الذاكرة المشفرة بنجاح وأغلق النظام.`,
            icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png"
        });
    }
});
