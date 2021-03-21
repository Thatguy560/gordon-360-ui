import React, { useEffect, useMemo, useState } from 'react';
import gordonEvent, { EVENT_FILTERS } from '../../services/event';
import EventList from '../../components/EventList';
import GordonLoader from '../../components/Loader';
import { gordonColors } from './../../theme';

import './event.scss';
import {
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';

const styles = {
  searchBar: {
    margin: '0 auto',
  },
};
const Events = (props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [includePast, setIncludePast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([]);
  const futureEvents = useMemo(() => gordonEvent.getFutureEvents(allEvents), [allEvents]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      let allEvents;
      if (props.authentication) {
        allEvents = await gordonEvent.getAllEvents();
      } else {
        allEvents = await gordonEvent.getAllGuestEvents();
      }
      setAllEvents(allEvents);

      // Load filters from UrlParams if they exist
      if (props.location.search) {
        const urlParams = new URLSearchParams(props.location.search);
        let willIncludePast = false;
        const filtersFromURL = [];

        for (const key of urlParams.keys()) {
          if (key === 'Past') {
            willIncludePast = true;
          } else {
            filtersFromURL.push(key);
          }
        }

        setFilters(filtersFromURL);
        setIncludePast(willIncludePast);
        setOpen(willIncludePast || filtersFromURL.length > 0);
      }

      setLoading(false);
    };

    loadEvents();
  }, [props.authentication, props.location.search]);

  useEffect(() => {
    setEvents(includePast ? allEvents : futureEvents);
  }, [includePast, allEvents, futureEvents]);

  useEffect(() => {
    setFilteredEvents(gordonEvent.getFilteredEvents(events, filters, search));
  }, [events, filters, search]);

  const handleExpandClick = () => {
    clearFilters();
    setOpen(!open);
  };

  const clearFilters = () => {
    setIncludePast(false);
    setFilters([]);
    setURLParams(false, []);
  };

  const handleChangeFilters = async (event) => {
    setFilters(event.target.value);
    setURLParams(includePast, event.target.value);
  };

  const handleChangeIncludePast = (event) => {
    setIncludePast(!includePast);
    setURLParams(!includePast, filters);
  };

  const setURLParams = (includePast, filters) => {
    if (includePast || filters.length > 0) {
      let url = '?';
      if (includePast) url += '&Past';
      url = filters.reduce((url, filter) => (url += `&${encodeURIComponent(filter)}`), url);
      props.history.push(url);
    } else if (props.location.search) {
      // If no params but current url has params, then push url with no params
      props.history.push();
    }
  };

  let content;

  if (loading === true) {
    content = <GordonLoader />;
  } else if (events.length > 0) {
    content = <EventList events={filteredEvents} />;
  }

  const filter = (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <FormGroup row>
        <FormControl style = {{minWidth: 120}}>
          <InputLabel id="event-filters">Filters</InputLabel>
          <Select
            labelId="event-filters"
            id="event-checkboxes"
            multiple
            value={filters}
            onChange={handleChangeFilters}
            input={<Input />}
            renderValue={(selected) => (
              <div className="filter-chips">
                {selected.map((value) => (
                  <Chip key={value} label={value} className="filter-chip" />
                ))}
              </div>
            )}
            // MenuProps={MenuProps}
          >
            {EVENT_FILTERS.map((filterName) => (
              <MenuItem
                key={filterName}
                value={filterName}
                // style={getStyles(filterName, personName, theme)}
              >
                {filterName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Checkbox checked={includePast} onChange={handleChangeIncludePast} />}
          label="Include Past"
        />
      </FormGroup>
    </Collapse>
  );

  const style = {
    button: {
      background: gordonColors.primary.cyan,
      color: 'white',

      attendedEvents: {
        background: gordonColors.primary.cyan,
        color: 'white',
        marginLeft: '0.88rem',
      },
    },
  };
  return (
    <section>
      <Grid container justify="center">
        {/* Search Bar and Filters */}
        <Grid
          item
          xs={10}
          sm={12}
          md={12}
          lg={8}
          alignContent="center"
          justify="center"
          style={{ paddingBottom: '1rem' }}
        >
          <Grid container alignItems="baseline" justify="center" style={styles.searchBar}>
            <Grid container xs={12} sm={5} md={8} lg={7}>
              <TextField
                id="search"
                label="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
              />
            </Grid>
            <Grid
              container
              justify="flex-end"
              direction="row"
              xs={12}
              sm={6}
              md={4}
              lg={5}
              style={{ paddingTop: '1rem' }}
              className={'buttonWrapper'}
            >
              <Button variant="contained" style={style.button} onClick={handleExpandClick}>
                {open && (includePast || filters.length > 0) ? 'CLEAR FILTERS' : 'FILTERS'}
              </Button>
              {props.authentication && (
                <Button
                  variant="contained"
                  style={style.button.attendedEvents}
                  onClick={() => props.history.push('/attended')}
                >
                  ATTENDED CL&amp;W
                </Button>
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* List of Events */}
        <Grid item xs={12} md={12} lg={8}>
          {filter}
          {content}
        </Grid>
      </Grid>
    </section>
  );
};

export default Events;
