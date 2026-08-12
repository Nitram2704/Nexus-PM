from rest_framework import views, response, status
from rest_framework.permissions import IsAuthenticated
from .models import Notification, NotificationSetting
from .serializers import NotificationSerializer, NotificationSettingSerializer
from django.http import StreamingHttpResponse
from django.utils import timezone
import time
import json

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

class NotificationStreamView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        def event_stream():
            yield 'data: {"status": "connected"}\n\n'
            last_check = timezone.now()
            while True:
                time.sleep(2)
                now = timezone.now()
                # Check for new notifications
                new_nots = Notification.objects.filter(user=request.user, created_at__gt=last_check)
                if new_nots.exists():
                    serializer = NotificationSerializer(new_nots, many=True)
                    yield f"data: {json.dumps(serializer.data)}\n\n"
                last_check = now

        resp = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        resp['Cache-Control'] = 'no-cache'
        resp['X-Accel-Buffering'] = 'no'
        return resp

class NotificationSettingsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings, _ = NotificationSetting.objects.get_or_create(user=request.user)
        serializer = NotificationSettingSerializer(settings)
        return response.Response(serializer.data)

    def put(self, request):
        settings, _ = NotificationSetting.objects.get_or_create(user=request.user)
        serializer = NotificationSettingSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

