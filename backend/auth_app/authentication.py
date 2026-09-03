from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model


class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise InvalidToken(
                _("Token contained no recognizable user identification")
            )

        User = get_user_model()
        try:
            user = User.objects.select_related('id_cargo').get(
                **{api_settings.USER_ID_FIELD: user_id}
            )
        except User.DoesNotExist:
            raise AuthenticationFailed(
                _("User not found"), code="user_not_found"
            )

        return user
