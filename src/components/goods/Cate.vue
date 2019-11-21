<template>
    <div>
       <!-- 面包屑区域 -->
    <el-breadcrumb
      separator-class="el-icon-arrow-right"
      class=""
    >
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary"  @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 树型表格 -->
      <tree-table  class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false"
      show-index index-text="#" border
      :show-row-hover="false">
      <template slot="isok" slot-scope="scope">
        <!-- 是否有效 -->
      <i class="el-icon-success" v-if="scope.row.cat_deleted ===false"
      style="color:lightgreen"></i>
      <i class="el-icon-error" v-else style="color:red"></i>
      </template>
      <template slot="order" slot-scope="scope">
        <!-- 排序 -->
      <el-tag size="mini" v-if="scope.row.cat_level ===0">一级</el-tag>
      <el-tag size="mini" type="success" v-else-if="scope.row.cat_level ===1">二级</el-tag>
      <el-tag size="mini" type="warning" v-else>三级</el-tag>
      </template>
      <template slot="opt">
        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
      </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
      <!-- 添加分类的弹出层 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%"
    @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
  <el-form :model="addCateForm"
  :rules="addCateFormRules"
  ref="addCateFormRef"
  label-width="100px">
    <el-form-item label="分类名称:" prop="cat_name">
      <el-input v-model="addCateForm.cat_name" ></el-input>
    </el-form-item>
    <el-form-item label="父级分类" >
      <el-cascader expand-trigger="hover" :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged"  >
          </el-cascader>
    </el-form-item>
  </el-form>
  <div slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate" >确 定</el-button>
  </div>
</el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品的数据列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 表示,将当前列表定义为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'isok'
      }, {
        label: '排序',
        // 表示，将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'order'
      },
      {
        label: '操作',
        // 表示,将当前列定义为模板列
        type: 'template',
        // 表示当前这一列使用模板名称
        template: 'opt'
      }],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 分类父id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加表单验证规则
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCatelist()
  },
  methods: {
    // 获取商品分类的数据
    async getCatelist() {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      console.log(res.data, 111)
      // 把数据列表赋值给catelist
      this.catelist = res.data.result
      // this.$message.success('获取商品列表成功')
      // 为总条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCatelist()
    },
    // 监听pagenum 改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCatelist()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      console.log(res, 11111)
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 当选择项发生改变时触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys, 123)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate() {
      console.log(this.$refs.addCateFormRef)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          console.log(valid)
          return false
        }
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCatelist()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>
<style scoped lang="less">
.treeTable {
  margin-top: 15px;
}

</style>
