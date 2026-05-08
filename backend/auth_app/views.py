from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import Usuario, Cargo
from .serializers import (
    UsuarioSerializer, 
    UsuarioCreateUpdateSerializer,
    CargoSerializer, 
    LoginSerializer
)


class CargoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar cargos de empleados"""
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    filterset_fields = ['nombre', 'created_at']
    search_fields = ['nombre']


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar usuarios"""
    queryset = Usuario.objects.all()
    filterset_fields = ['activo', 'cargo', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UsuarioCreateUpdateSerializer
        return UsuarioSerializer
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Autenticación de usuario"""
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        usuario = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        
        if usuario is None:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response({
            'id': usuario.id,
            'username': usuario.username,
            'email': usuario.email,
            'first_name': usuario.first_name,
            'last_name': usuario.last_name,
            'cargo': usuario.cargo.nombre if usuario.cargo else None,
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener datos del usuario autenticado"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'No autenticado'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

