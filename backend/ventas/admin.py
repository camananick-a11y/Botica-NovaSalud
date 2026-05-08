from django.contrib import admin
from .models import Comprobante, Venta, DetalleVenta

class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 1
    readonly_fields = ('subtotal',)


@admin.register(Comprobante)
class ComprobanteAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'tipo', 'serie', 'numero')
    list_filter = ('tipo',)
    search_fields = ('serie',)


@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'fecha_venta', 'total', 'metodo_pago', 'estado')
    list_filter = ('estado', 'metodo_pago', 'fecha_venta')
    search_fields = ('cliente__nombre', 'cliente__apellido', 'id')
    readonly_fields = ('created_at', 'updated_at', 'fecha_venta', 'subtotal', 'igv', 'total')
    inlines = [DetalleVentaInline]
    fieldsets = (
        ('Información del Comprobante', {
            'fields': ('comprobante', 'cliente', 'usuario', 'fecha_venta')
        }),
        ('Detalles Financieros', {
            'fields': ('subtotal', 'descuento', 'igv', 'total')
        }),
        ('Método de Pago', {
            'fields': ('metodo_pago',)
        }),
        ('Estado', {
            'fields': ('estado', 'observaciones')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DetalleVenta)
class DetalleVentaAdmin(admin.ModelAdmin):
    list_display = ('venta', 'medicamento', 'cantidad', 'precio_unitario', 'subtotal')
    list_filter = ('created_at',)
    search_fields = ('venta__id', 'medicamento__nombre')
    readonly_fields = ('subtotal', 'created_at')

