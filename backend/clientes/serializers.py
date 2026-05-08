from rest_framework import serializers
from .models import Cliente


class ClienteSerializer(serializers.ModelSerializer):
    edad = serializers.SerializerMethodField()
    
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'apellido', 'numero_documento', 'tipo_documento',
                  'telefono', 'email', 'direccion', 'ciudad', 'distrito', 
                  'referencia', 'fecha_nacimiento', 'genero', 'tipo_cliente',
                  'edad', 'activo', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_edad(self, obj):
        """Calcula la edad del cliente si tiene fecha de nacimiento"""
        if obj.fecha_nacimiento:
            from datetime import date
            today = date.today()
            return today.year - obj.fecha_nacimiento.year - (
                (today.month, today.day) < (obj.fecha_nacimiento.month, obj.fecha_nacimiento.day)
            )
        return None
