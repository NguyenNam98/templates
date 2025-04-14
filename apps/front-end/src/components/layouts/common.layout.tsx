import { Fragment } from 'react'
import { Outlet } from 'react-router-dom'
const CommonLayout = () => (
  <Fragment>
    <Outlet />
  </Fragment>
)

export default CommonLayout
