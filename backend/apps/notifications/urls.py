from django.urls import path
from .views import NotificationListView, NotificationMarkReadView, NotificationBulkReadView, NotificationStreamView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<uuid:notification_id>/read/', NotificationMarkReadView.as_view(), name='notification-read'),
    path('mark-all-read/', NotificationBulkReadView.as_view(), name='notification-bulk-read'),
    path('stream/', NotificationStreamView.as_view(), name='notification-stream'),
]
