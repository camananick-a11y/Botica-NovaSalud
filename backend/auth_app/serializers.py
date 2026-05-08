from rest_framework import serializers
from .models import Cargo, Usuario


class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = ['id', 'nombre', 'descripcion', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UsuarioSerializer(serializers.ModelSerializer):
    cargo_nombre = serializers.CharField(source='cargo.nombre', read_only=True)
    
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'cargo', 
                  'cargo_nombre', 'telefono', 'activo', 'date_joined']
        read_only_fields = ['date_joined']


class UsuarioCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Usuario
        fields = ['username', 'email', 'first_name', 'last_name', 'cargo', 
                  'telefono', 'activo', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        usuario = Usuario.objects.create(**validated_data)
        if password:
            usuario.set_password(password)
            usuario.save()
        return usuario
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
