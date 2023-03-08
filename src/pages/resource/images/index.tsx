import { useEffect, useState } from "react";
import {
  Button,
  Row,
  Col,
  Popconfirm,
  Image,
  Empty,
  message,
  Pagination,
} from "antd";
import { resource } from "../../../api";
import styles from "./index.module.less";
import { CloseOutlined } from "@ant-design/icons";
import { UploadImageSub } from "../../../compenents/upload-image-button/upload-image-sub";
import { TreeCategory, PerButton } from "../../../compenents";

interface CategoryItem {
  id: number;
  type: string;
  name: string;
  sort: number;
}

interface ImageItem {
  id: number;
  category_id: number;
  name: string;
  extension: string;
  size: number;
  disk: string;
  file_id: string;
  path: string;
  url: string;
  created_at: string;
}

export const ResourceImagesPage = () => {
  const [imageList, setImageList] = useState<ImageItem[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [category_ids, setCategoryIds] = useState<any>([]);

  // 删除图片
  const removeCategory = (id: number) => {
    if (id === 0) {
      return;
    }
    resource.destroyResource(id).then(() => {
      message.success("删除成功");
      resetImageList();
    });
  };

  // 获取图片列表
  const getImageList = () => {
    let categoryIds = category_ids.join(",");
    resource
      .resourceList(page, size, "", "", "", "IMAGE", categoryIds)
      .then((res: any) => {
        setTotal(res.data.result.total);
        setImageList(res.data.result.data);
      })
      .catch((err: any) => {
        console.log("错误,", err);
      });
  };
  // 重置列表
  const resetImageList = () => {
    setPage(1);
    setImageList([]);
    setRefresh(!refresh);
  };

  // 加载图片列表
  useEffect(() => {
    getImageList();
  }, [category_ids, refresh, page, size]);

  return (
    <>
      <Row>
        <Col span={4}>
          <div className="playedu-main-body" style={{ marginLeft: -24 }}>
            <TreeCategory onUpdate={(keys: any) => setCategoryIds(keys)} />
          </div>
        </Col>
        <Col span={20}>
          <div className="playedu-main-body">
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <UploadImageSub
                  categoryId={Number(category_ids.join(","))}
                  onUpdate={() => {
                    resetImageList();
                  }}
                ></UploadImageSub>
              </Col>
            </Row>
            <Row
              gutter={[
                { xs: 8, sm: 16, md: 24, lg: 32 },
                { xs: 4, sm: 8, md: 12, lg: 16 },
              ]}
            >
              {imageList.length === 0 && (
                <Col span={24}>
                  <Empty description="暂无图片" />
                </Col>
              )}

              {imageList.map((item) => (
                <Col key={item.id} span={6}>
                  <div className={styles.imageItem}>
                    <Image
                      preview={false}
                      width={120}
                      height={80}
                      src={item.url}
                    />
                    <Popconfirm
                      title="警告"
                      description="即将删除此图片，确认操作？"
                      onConfirm={() => removeCategory(item.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        className={styles.closeButton}
                        danger
                        shape="circle"
                        icon={<CloseOutlined />}
                      />
                    </Popconfirm>
                  </div>
                </Col>
              ))}

              {imageList.length > 0 && (
                <Col span={24}>
                  <Pagination
                    showSizeChanger
                    onChange={(currentPage, currentSize) => {
                      setPage(currentPage);
                      setSize(currentSize);
                    }}
                    defaultCurrent={page}
                    total={total}
                  />
                </Col>
              )}
            </Row>
          </div>
        </Col>
      </Row>
    </>
  );
};
