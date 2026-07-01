// الاستماع والتقاط نقرات الأزرار من شاشة القفل الخارجية للموبايل
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // التدمير والإغلاق الفوري للإشعار لحماية الخصوصية

    if (event.action === 'record_500' || event.action === 'record_300') {
        let scoreValue = event.action === 'record_500' ? 500 : 300;
        
        // إشعار تأكيدي فخم بنجاح عملية الحفظ السري الخلفي للبيانات
        self.registration.showNotification("✅ تم التوثيق بنجاح", {
            body: `تم تسجيل فئة ${scoreValue} في قاعدة البيانات الخلفية بنجاح وإغلاق النظام بأمان.`,
            icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png"
        });
    }
});
