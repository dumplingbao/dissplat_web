<template>
<div>
   <Card>
    <Form :model="formItem" :label-width="80" ref="formCustom" :rules="ruleValidate" >
        <FormItem label="邮箱" prop="email">
            <Input v-model="formItem.email" placeholder="请输入邮箱"  size="large" clearable required/>
        </FormItem>
        <FormItem label="昵称" prop="nickname">
            <Input v-model="formItem.nickname" placeholder="请输入昵称" size="large" clearable required />
        </FormItem>
        <FormItem label="密码" prop="password">
            <Input v-model="formItem.password" placeholder="请输入密码" size="large" clearable  required/>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="handleSubmit('formCustom')">保存</Button>
            <Button  style="margin-left: 8px" @click="handleCancel">取消</Button>
        </FormItem>
    </Form>
   </Card>
</div>
</template>
<script>
/* eslint-disable */
import userApi from "@/api/user";
import { Message } from "iview";
export default {
  data() {
    return {
      formItem: {authorities:['ROLE_UNIT_ADMIN'],userType:"UNIT_ADMIN"},
      ruleValidate: {
        nickname: [{ required: true, message: "不能为空", trigger: "blur" }],
        email: [{ required: true, message: "不能为空", trigger: "blur" }],
        password: [{ required: true, message: "不能为空", trigger: "blur" }]
      }
    };
  },
  methods: {
    handleSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid){
            this.save();
        }
      });
    },
    handleCancel() {
      this.$router.back();
    },
    save() {
        console.log(this.formItem)
      userApi.save(this.formItem).then(res => {
        if (res.data.msg=='success') {
          Message.success("保存成功");
          this.$router.back();
        }
      });
    }
  },
  mounted() {
     
    // if (this.$route.params.id>0) {
    //   userApi.getById(this.$route.params.id).then(res => {
    //     this.formItem = res.data;
    //   });
    // }
  }
};
</script>