import React, { useState, useEffect } from "react";
import { Modal, Form, Cascader, Input, message } from "antd";
import styles from "./create.module.less";
import { user, department } from "../../../api/index";
import { UploadImageButton } from "../../../compenents";

interface PropInterface {
  id: number;
  open: boolean;
  onCancel: () => void;
}

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

export const MemberUpdate: React.FC<PropInterface> = ({
  id,
  open,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [departments, setDepartments] = useState<any>([]);
  const [avatar, setAvatar] = useState<string>("");

  useEffect(() => {
    getParams();
  }, [id]);

  useEffect(() => {
    form.setFieldsValue({
      password: "",
    });
  }, [form, open]);

  const getParams = () => {
    if (id === 0) {
      return;
    }
    department.departmentList().then((res: any) => {
      const departments = res.data.departments;
      if (JSON.stringify(departments) !== "{}") {
        const new_arr: Option[] = checkArr(departments, 0);
        setDepartments(new_arr);
      }
      getDetail(departments);
    });
  };

  const getDetail = (deps: any) => {
    user.user(id).then((res: any) => {
      let user = res.data.user;
      setAvatar(user.avatar);
      let box = res.data.dep_ids;
      let depIds: any[] = [];
      if (box.length > 1) {
        for (let i = 0; i < box.length; i++) {
          let item = checkChild(deps, box[i]);
          let arr: any[] = [];
          if (item === undefined) {
            arr.push(box[i]);
          } else if (item.parent_chain === "") {
            arr.push(box[i]);
          } else {
            let new_arr = item.parent_chain.split(",");
            new_arr.map((num: any) => {
              arr.push(Number(num));
            });
            arr.push(box[i]);
          }
          depIds.push(arr);
        }
      } else {
        depIds = res.data.dep_ids;
      }
      form.setFieldsValue({
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        avatar: user.avatar,
        idCard: user.id_card,
        dep_ids: depIds,
      });
    });
  };

  const checkChild = (departments: any[], id: number) => {
    for (let key in departments) {
      for (let i = 0; i < departments[key].length; i++) {
        if (departments[key][i].id === id) {
          return departments[key][i];
        }
      }
    }
  };

  const checkArr = (departments: any[], id: number) => {
    const arr = [];
    for (let i = 0; i < departments[id].length; i++) {
      if (!departments[departments[id][i].id]) {
        arr.push({
          label: departments[id][i].name,
          value: departments[id][i].id,
        });
      } else {
        const new_arr: Option[] = checkArr(departments, departments[id][i].id);
        arr.push({
          label: departments[id][i].name,
          value: departments[id][i].id,
          children: new_arr,
        });
      }
    }
    return arr;
  };

  const onFinish = (values: any) => {
    const arr = [];
    for (let i = 0; i < values.dep_ids.length; i++) {
      if (Array.isArray(values.dep_ids[i])) {
        arr.push(values.dep_ids[i][values.dep_ids[i].length - 1]);
      } else {
        arr.push(values.dep_ids[i]);
      }
    }
    user
      .updateUser(
        id,
        values.email,
        values.name,
        values.nickname,
        values.avatar,
        values.password || "",
        values.idCard,
        arr
      )
      .then((res: any) => {
        message.success("保存成功！");
        onCancel();
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const onChange = (value: any) => {};

  return (
    <>
      <Modal
        title="编辑学员"
        centered
        forceRender
        open={open}
        width={416}
        onOk={() => form.submit()}
        onCancel={() => onCancel()}
        maskClosable={false}
      >
        <div className="float-left mt-24">
          <Form
            form={form}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="学员姓名"
              name="name"
              rules={[{ required: true, message: "请输入学员姓名!" }]}
            >
              <Input style={{ width: 200 }} placeholder="请输入学员姓名" />
            </Form.Item>
            <Form.Item
              label="学员头像"
              name="avatar"
              rules={[{ required: true, message: "请上传学员头像!" }]}
            >
              <div className="c-flex">
                <div className="d-flex">
                  <UploadImageButton
                    onSelected={(url) => {
                      setAvatar(url);
                      form.setFieldsValue({ avatar: url });
                    }}
                  ></UploadImageButton>
                </div>
                {avatar && (
                  <img className="form-avatar mt-10" src={avatar} alt="" />
                )}
              </div>
            </Form.Item>
            <Form.Item
              label="登录密码"
              name="password"
              rules={[{ required: true, message: "请输入登录密码!" }]}
            >
              <Input.Password
                style={{ width: 200 }}
                placeholder="请输入登录密码"
              />
            </Form.Item>
            <Form.Item
              label="学员邮箱"
              name="email"
              rules={[{ required: true, message: "请输入学员邮箱!" }]}
            >
              <Input style={{ width: 200 }} placeholder="请输入学员邮箱" />
            </Form.Item>
            <Form.Item
              label="身份证号"
              name="idCard"
              rules={[{ required: true, message: "请输入身份证号!" }]}
            >
              <Input style={{ width: 200 }} placeholder="请输入身份证号" />
            </Form.Item>
            <Form.Item label="学员部门" name="dep_ids">
              <Cascader
                style={{ width: 200 }}
                options={departments}
                onChange={onChange}
                multiple
                maxTagCount="responsive"
                placeholder="请选择学员部门"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};