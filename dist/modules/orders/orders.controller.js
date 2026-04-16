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
    async getActiveOrders(businessId) {
        return this.ordersService.getActiveOrders(businessId);
    }
    async getAnalytics(businessId, period = 'month', months = '6') {
        return this.ordersService.getAnalytics(businessId, period, parseInt(months));
    }
    async getTableOrder(tableId, businessId) {
        return this.ordersService.getOrCreateOrder(tableId, businessId);
    }
    async addItem(data, businessId) {
        const order = await this.ordersService.getOrCreateOrder(data.tableId, businessId);
        return this.ordersService.addItemToOrder(order.id, data.productId, data.quantity, businessId);
    }
    async updateItem(itemId, data) {
        return this.ordersService.updateItemQuantity(itemId, data.quantity);
    }
    async deleteItem(itemId) {
        return this.ordersService.removeItem(itemId);
    }
    async markAsDelivered(orderId) {
        return this.ordersService.markAsDelivered(orderId);
    }
    async reopenOrder(orderId) {
        return this.ordersService.reopenOrder(orderId);
    }
    async closeOrder(orderId, data = {}) {
        return this.ordersService.closeOrder(orderId, data.payment_method);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Headers)('x-business-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getActiveOrders", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Headers)('x-business-id')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('table/:tableId'),
    __param(0, (0, common_1.Param)('tableId')),
    __param(1, (0, common_1.Headers)('x-business-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
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
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('item/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Patch)(':orderId/mark-delivered'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "markAsDelivered", null);
__decorate([
    (0, common_1.Patch)(':orderId/reopen'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "reopenOrder", null);
__decorate([
    (0, common_1.Post)('close/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "closeOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map