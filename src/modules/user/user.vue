<template>
  <div>
    <Card>
      <div class="search-con search-con-top">
        <Button @click="handleAdd" type="primary">
          <icon type="md-add"></icon>&nbsp;&nbsp;新增
        </Button>&nbsp;&nbsp;
        <Button @click="handleBack"> <Icon type="md-arrow-round-back" />&nbsp;&nbsp;返回</Button></Button>
      </div>
      <tables ref="tables" v-model="tableData" :columns="columns" />
    </Card>
  </div>
</template>

<script>
/* eslint-disable */
  import Tables from "_c/tables";
  import userApi from '@/api/user'
  import {
    Message
  } from "iview";

  export default {
    name: "authority",
    components: {
      Tables
    },
    data() {
      return {
        columns: [{
            title: "昵称",
            key: "nickname"
          },
          {
            title: "邮箱",
            key: "email"
          },
          {
            title: '创建时间',
            key: 'created_at'
          },
          {
            title: "操作",
            key: "handle",
            button: [
              (h, params, vm) => {
                let type = "error";
                let text = "禁用"
                if (params.row.statusType === "Disabled") {
                  type = "success";
                  text = "启用"
                }
                return h("div", [h("Button", {
                  props: {
                    type: type
                  },
                  on: {
                    click: () => {
                      this.handleDelete(params.row);
                    }
                  }
                }, text)]);
              }
            ]
          }
        ],
        tableData: [],
        unitId: this.$route.params.id
      };
    },
    methods: {
      handleSearch() {
        userApi.userList().then(res => {
          console.log(res)
          this.tableData = res.data.data.data;
        });
      },
      handleDelete(row) {
        let me = this;
        let title = "是否禁用";
        let status = "Disabled"
        if (row.statusType === "Disabled") {
          title = "是否启用";
          status = "Normal"
        }
        me.$Modal.confirm({
          title: title,
          closable: true,
          onOk: function () {
            userApi.updateStatus(row.id, status).then(res => {
              if (res.data.msg=='success') {
                Message.success("操作成功");
                me.handleSearch();
              }
            });
          }
        });
      },
      handleAdd(row) {
        this.$router.push({
          name: "user_add"
        });
      },
      handleBack() {
        this.$router.back()
      }
    },
    mounted() {
      this.handleSearch();
    }
  };

</script>
<style>
</style>
