from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id_cliente', 'nombre', 'tipo_documento', 'numero_documento', 'direccion', 'telefono', 'correo']
