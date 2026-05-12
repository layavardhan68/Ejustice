"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'https://ejustice-smart-court.onrender.com/api';
const testEndpoints = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Testing Users...');
        const users = yield axios_1.default.get(`${BASE_URL}/users`);
        console.log(`Users count: ${users.data.length}`);
        console.log('Testing Cases...');
        const cases = yield axios_1.default.get(`${BASE_URL}/cases`);
        console.log(`Cases count: ${cases.data.length}`);
        console.log('Testing Documents...');
        const docs = yield axios_1.default.get(`${BASE_URL}/documents`);
        console.log(`Documents count: ${docs.data.length}`);
        console.log('Testing Hearings...');
        const hearings = yield axios_1.default.get(`${BASE_URL}/hearings`);
        console.log(`Hearings count: ${hearings.data.length}`);
        console.log('All tests passed!');
    }
    catch (err) {
        console.error('Test failed:', err === null || err === void 0 ? void 0 : err.message);
        if (err === null || err === void 0 ? void 0 : err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
});
testEndpoints();
