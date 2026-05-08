from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.id_cargo.nombre == 'Administrador'

class IsVendedor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.id_cargo.nombre in ['Administrador', 'Vendedor']

class IsAlmacenero(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.id_cargo.nombre in ['Administrador', 'Almacenero']

class IsSupervisor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.id_cargo.nombre in ['Administrador', 'Supervisor']
