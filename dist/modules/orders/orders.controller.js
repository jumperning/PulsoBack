"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    getActiveOrders(businessId) {
        return this.ordersService.getActiveOrders(businessId);
    }
    getAnalytics(businessId, period = 'month', months = '6') {
        return this.ordersService.getAnalytics(businessId, period, parseInt(months, 10));
    }
    getTableOrder(tableId, businessId) {
        return this.ordersService.getOrCreateOrder(tableId, businessId);
    }
    async addItem(body, businessId) {
        const { tableId, productId, quantity } = body;
        if (!tableId || !productId || !quantity) {
            throw new common_1.BadRequestException('tableId, productId y quantity son requeridos');
        }
        const order = await this.ordersService.getOrCreateOrder(tableId, businessId);
        return this.ordersService.addItemToOrder(order.id, productId, quantity, businessId);
    }
    updateItem(itemId, body) {
        return this.ordersService.updateItemQuantity(itemId, body.quantity);
    }
    deleteItem(itemId) {
        return this.ordersService.removeItem(itemId);
    }
    markAsDelivered(orderId) {
        return this.ordersService.markAsDelivered(orderId);
    }
    reopenOrder(orderId) {
        return this.ordersService.reopenOrder(orderId);
    }
    closeOrder(orderId, body = {}) {
        return this.ordersService.closeOrder(orderId, body.payment_method);
    }
    importOrders(orders, businessId) {
        return this.ordersService.importOrders(orders, businessId);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Headers)('x-business-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getActiveOrders", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Headers)('x-business-id')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('table/:tableId'),
    __param(0, (0, common_1.Param)('tableId')),
    __param(1, (0, common_1.Headers)('x-business-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getTableOrder", null);
__decorate([
    (0, common_1.Post)('add-item'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-business-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)('item/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('item/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Patch)(':orderId/mark-delivered'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "markAsDelivered", null);
__decorate([
    (0, common_1.Patch)(':orderId/reopen'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "reopenOrder", null);
__decorate([
    (0, common_1.Post)('close/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "closeOrder", null);
__decorate([
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-business-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "importOrders", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map