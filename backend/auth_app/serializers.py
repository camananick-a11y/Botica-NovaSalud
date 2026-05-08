from rest_framework import serializers
from .models import Cargo, Usuario

class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = ['id_cargo', 'nombre']

class UsuarioSerializer(serializers.ModelSerializer):
    cargo_nombre = serializers.CharField(source='id_cargo.nombre', read_only=True)
    
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'usuario', 'nombre', 'id_cargo', 'cargo_nombre']

class UsuarioCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = ['usuario', 'nombre', 'id_cargo', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
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
    usuario = serializers.CharField()
    password = serializers.CharField(write_only=True)
