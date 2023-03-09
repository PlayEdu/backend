import React, { useEffect } from "react";
import styles from "./index.module.less";
import { Outlet } from "react-router-dom";
import { Header, LeftMenu } from "../../compenents";

export const HomePage: React.FC = () => {
  useEffect(() => {}, []);

  return (
    <>
      <div className={styles["layout-wrap"]}>
        <div className={styles["left-menu"]}>
          <LeftMenu />
        </div>
        <div className={styles["right-cont"]}>
          <div className={styles["right-top"]}>
            <Header></Header>
          </div>
          <div className={styles["right-main"]}>
            {/* 二级路由出口 */}
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};
