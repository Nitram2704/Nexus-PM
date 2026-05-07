from rest_framework import views, response, status
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        # Optional: unread_only = request.query_params.get('unread_only')
        serializer = NotificationSerializer(notifications, many=True)
        return response.Response(serializer.data)

class NotificationMarkReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return response.Response({'status': 'read'})
        except Notification.DoesNotExist:
            return response.Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

class NotificationBulkReadView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return response.Response({'status': 'all_read'})
