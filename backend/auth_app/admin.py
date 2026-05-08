from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario, Cargo

@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'created_at')
    search_fields = ('nombre',)
    list_filter = ('created_at',)


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'cargo', 'activo')
    list_filter = ('activo', 'cargo', 'date_joined')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información Adicional', {'fields': ('cargo', 'telefono', 'activo')}),
    )

