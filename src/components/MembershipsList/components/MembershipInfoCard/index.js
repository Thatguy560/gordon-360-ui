import React from 'react';
import classnames from 'classnames';
import { Divider, Grid, List, ListItem, Switch, Typography } from '@material-ui/core/';
import { Link } from 'react-router-dom';
import LockIcon from '@material-ui/icons/Lock';
import useNetworkStatus from '../../../../hooks/useNetworkStatus';
import './index.css';

const MembershipInfoCard = ({ myProf, membership, onTogglePrivacy }) => {
  const isOnline = useNetworkStatus();

  const OnlineOnlyLink = ({ children }) => {
    const linkClass = classnames({
      'gc360-link': isOnline,
      'private-membership': membership.IsInvolvementPrivate || membership.Privacy,
      'public-membership': !(membership.IsInvolvementPrivate || membership.Privacy),
    });
    if (isOnline) {
      return (
        <Link
          className={linkClass}
          to={`/activity/${membership[0].SessionCode}/${membership[0].ActivityCode}`}
        >
          {children}
        </Link>
      );
    } else {
      return <div className={linkClass}>{children}</div>;
    }
  };

  return (
    <>
      <Grid container alignItems="center" justify="center" className="membership-info-card">
        <Grid
          container
          xs={8}
          sm={9}
          md={9}
          lg={8}
          xl={9}
          justify="flex-start"
          alignItems="center"
          className="membership-info-card-description"
        >
          <Grid container xs={8} alignItems="center">
            <List>
              <ListItem className="my-profile-info-card-description-text">
                <OnlineOnlyLink>
                  <Typography fontWeight="fontWeightBold">
                    {membership[0].ActivityDescription}
                  </Typography>
                  <Typography>{membership.SessionDescription}</Typography>
                  <Typography>{membership.ParticipationDescription}</Typography>
                </OnlineOnlyLink>
              </ListItem>
            </List>
          </Grid>

          {myProf && (
            <Grid container xs={4} alignItems="center">
              <Grid container>
                <Grid item xs={12} align="center">
                  {isOnline &&
                    (membership[0].IsInvolvementPrivate ? (
                      <LockIcon className="lock-icon" />
                    ) : (
                      <Switch
                        onChange={() => {
                          onTogglePrivacy(membership[0]);
                        }}
                        checked={!membership[0].Privacy}
                      />
                    ))}
                </Grid>
                <Grid item xs={12} align="center">
                  <Typography>
                    {membership[0].Privacy || membership[0].IsInvolvementPrivate ? 'Private' : 'Public'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>

        <Grid
          container
          xs={4}
          sm={3}
          md={3}
          lg={4}
          xl={3}
          className="membership-info-card-image"
          alignItems="center"
        >
          <OnlineOnlyLink>
            <img src={membership[0].ActivityImagePath} alt="" className={isOnline ? 'active' : ''} />
          </OnlineOnlyLink>
        </Grid>
      </Grid>
      <Divider />
    </>
  );
};

export default MembershipInfoCard;
