## 做题时间记录

- 11:00 开始文档编写
- 11:10 开会编码

## feature 列表

### 测试

- [ ] 部署基础的测试能力
- [ ] 针对各个 feature 点补足测试用例

### level 1 功能

- [x] 添加监听的时候，需要是类型安全的
- [x] 基本的监听能力
- [x] 多重监听
- [x] 触发等基本功能
- [ ] 卸载监听

### level 2 功能

- [ ] 在 listener 的回调中 this 必须是类型安全
- [ ] 在 listener 中可以继续触发事件，要求在总线对象内部要保持正确的事件调用栈，并能提供接口打印出来

### level 3 功能

- [ ] 增加对 async callback 的支持，并要求仍然能够正确打印出调用栈。
- [ ] 增加对无线循环调用事件的判断。

## 参考资料

[ts 如何声明函数的 this](https://www.typescriptlang.org/docs/handbook/2/functions.html#declaring-this-in-a-function)
