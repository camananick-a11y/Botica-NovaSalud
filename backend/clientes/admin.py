from django.contrib import admin
from .models import Cliente

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'numero_documento', 'telefono', 'tipo_cliente', 'activo')
    list_filter = ('tipo_cliente', 'tipo_documento', 'activo', 'created_at')
    search_fields = ('nombre', 'apellido', 'numero_documento', 'email', 'telefono')
    fieldsets = (
        ('Información Personal', {
            'fields': ('nombre', 'apellido', 'fecha_nacimiento', 'genero')
        }),
        ('Identificación', {
            'fields': ('tipo_documento', 'numero_documento')
        }),
        ('Contacto', {
            'fields': ('telefono', 'email')
        }),
        ('Dirección', {
            'fields': ('direccion', 'ciudad', 'distrito', 'referencia')
        }),
        ('Estado', {
            'fields': ('tipo_cliente', 'activo')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

