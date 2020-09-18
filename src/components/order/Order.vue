<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>

      <el-row>
        <!-- 头部搜索区域 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append"
                       icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据 -->
      <el-table :data="orderList"
                border
                stripe>
        <!-- 索引列 -->
        <el-table-column type="index"
                         label="#"></el-table-column>

        <el-table-column label="订单编号"
                         prop="order_number"></el-table-column>

        <el-table-column label="订单价格"
                         prop="order_price"
                         width="80px"></el-table-column>

        <el-table-column label="是否付款"
                         prop="pay_status"
                         width="80px">
          <template slot-scope="scope">
            <el-tag type="success"
                    v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger"
                    v-else>未付款</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="是否发货"
                         prop="is_send"
                         width="80px"></el-table-column>

        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template>
            <el-button type="primary"
                       size="mini"
                       icon="el-icon-edit"></el-button>
            <el-button type="success"
                       size="mini"
                       icon="el-icon-location"></el-button>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15,20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total"
                     background>
      </el-pagination>

    </el-card>

  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询订列表所需要的对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 获取的订单列表数据
      orderList: [],
      // 总条数
      total: 0
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    /**
     * 获取订单列表
     */
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })

      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }

      this.orderList = res.data.goods

      this.total = res.data.total
    },
    /**
     * pagesize 发生改变出发的事件
     */
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    /**
     * pagenum 发生改变触发的事件
     */
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
