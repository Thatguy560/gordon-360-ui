import { Divider, Drawer, Hidden } from '@material-ui/core';
import React from 'react';
import GordonNavAvatar from './components/NavAvatar';
import GordonNavLinks from './components/NavLinks';

const GordonNav = ({ onDrawerToggle, authentication, onSignOut, drawerOpen }) => (
  <Hidden mdUp>
    <Drawer
      variant="temporary"
      open={drawerOpen}
      onClose={onDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      <GordonNavAvatar onLinkClick={onDrawerToggle} authentication={authentication} />
      <Divider />
      <GordonNavLinks
        onLinkClick={onDrawerToggle}
        onSignOut={onSignOut}
        authentication={authentication}
      />
    </Drawer>
  </Hidden>
);

export default GordonNav;
