from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import Usuario, Cargo
from .serializers import (
    UsuarioSerializer, 
    UsuarioCreateUpdateSerializer,
    CargoSerializer, 
    LoginSerializer,
    PerfilSerializer,
)
from .permissions import IsAdminUser

class CargoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar cargos de empleados"""
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['nombre']

class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar usuarios"""
    queryset = Usuario.objects.select_related('id_cargo').all()
    search_fields = ['usuario', 'nombre']

    def get_permissions(self):
        if self.action == 'login':
            return [AllowAny()]
        if self.action in ['me', 'perfil']:
            return [IsAuthenticated()]
        return [IsAdminUser()]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UsuarioCreateUpdateSerializer
        if self.action == 'perfil':
            return PerfilSerializer
        return UsuarioSerializer
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Autenticación de usuario"""
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        usuario = authenticate(
            username=serializer.validated_data['usuario'],
            password=serializer.validated_data['password']
        )
        
        if usuario is None:
            return Response(
                {'error': 'Credenciales inválidas'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response({
            'id_usuario': usuario.id_usuario,
            'usuario': usuario.usuario,
            'nombre': usuario.nombre,
            'id_cargo': usuario.id_cargo.id_cargo,
            'cargo_nombre': usuario.id_cargo.nombre if usuario.id_cargo else None,
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
    
    @action(detail=False, methods=['get', 'patch'])
    def perfil(self, request):
        if request.method == 'GET':
            serializer = UsuarioSerializer(request.user)
            return Response(serializer.data)
        serializer = PerfilSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UsuarioSerializer(request.user).data)
