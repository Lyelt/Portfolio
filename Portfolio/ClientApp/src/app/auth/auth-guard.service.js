"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthGuard = /** @class */ (function () {
    function AuthGuard(jwtHelper, router) {
        this.jwtHelper = jwtHelper;
        this.router = router;
    }
    AuthGuard.prototype.canActivate = function () {
        var token = localStorage.getItem("jwt");
        if (token && !this.jwtHelper.isTokenExpired(token)) {
            return true;
        }
        this.router.navigate(["login"]);
        return false;
    };
    return AuthGuard;
}());
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth-guard.service.js.map