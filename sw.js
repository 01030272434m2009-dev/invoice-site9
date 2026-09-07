// 🟢 1. التثبيت والتنشيط الفوري لضمان العمل المستمر 24/7
self.addEventListener('install', (event) => {
    self.skipWaiting(); // التنشيط المباشر للخدمة
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); // السيطرة الفورية على جميع الصفحات
});

// 🟢 2. الاستماع لنقرات الإشعارات وتحديد الأكشن الذكي
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // إغلاق الإشعار فور النقر

    const action = event.action;
    const expiryTime = new Date().getTime() + (15 * 60 * 1000); // جلسة 15 دقيقة
    const baseUrl = new URL('./', self.location.href).href;

    // 🟢 الحالة الأولى: فتح اللوحة وتفعيل جلسة الـ 15 دقيقة
    if (action === 'open_app_real' || action === '' || !action) {
        const targetUrl = `${baseUrl}?session_expiry=${expiryTime}`;

        const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(windowClients) {
                // البحث عن صفحة مفتوحة مسبقاً والتوجيه المباشر إليها
                for (let i = 0; i < windowClients.length; i++) {
                    let client = windowClients[i];
                    if ('focus' in client) {
                        client.postMessage({ type: 'SET_SESSION_EXPIRY', expiry: expiryTime });
                        if ('navigate' in client) {
                            client.navigate(targetUrl);
                        }
                        return client.focus();
                    }
                }
                // إذا كان المتصفح/التطبيق مغلقاً تماماً، فتح نافذة جديدة برابط الجلسة
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            });

        event.waitUntil(promiseChain);
    }

    // 🟢 الحالة الثانية: التوثيق المالي السريع (500 ج.م أو 300 ج.م)
    if (action === 'record_500' || action === 'record_300') {
        const amountValue = (action === 'record_500') ? 500 : 300;

        const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(async function(windowClients) {
                let messageSent = false;

                // 1. إرسال البيانات للصفحات المفتوحة حالياً
                windowClients.forEach(client => {
                    client.postMessage({ 
                        type: 'RECORD_FINANCIAL', 
                        amount: amountValue,
                        timestamp: new Date().getTime()
                    });
                    messageSent = true;
                });

                // 2. الذكاء الاصطناعي للخدمة: إذا كان التطبيق مغلقاً تماماً، يتم حفظ الحركة مؤقتاً
                if (!messageSent) {
                    await storePendingRecord(amountValue);
                }

                // 3. إظهار إشعار تأكيد تفاعلي فاخر مع اهتزاز مخصص
                return self.registration.showNotification("💰 تم التوثيق المالي بنجاح", {
                    body: `✅ تم تسجيل مبلغ ${amountValue} ج.م في تقريرك المالي اليومي.`,
                    icon: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
                    badge: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
                    vibrate: [100, 50, 100], // اهتزاز تفاعلي أنيق
                    tag: "financial-confirmation",
                    renotify: true,
                    data: { amount: amountValue }
                });
            });

        event.waitUntil(promiseChain);
    }
});

// 🟢 3. دالة حجز السجلات للعمل في الأوفلاين وإغلاق المتصفح (IndexedDB / Cache)
async function storePendingRecord(amount) {
    if ('caches' in self) {
        const cache = await caches.open('pending-financial-v1');
        const responseData = new Response(JSON.stringify({
            amount: amount,
            date: new Date().toISOString()
        }));
        await cache.put(`/pending-${Date.now()}`, responseData);
    }
}
