import express from 'express';
import {
  changeUserTempId,
  checkOverlaps,
  createAppointment,
  createBusiness,
  createClient,
  createDailySchedule,
  createService,
  createUser,
  createWorkWeek,
  deleteAppointment,
  deleteClient,
  deleteService,
  getAllOwnerClients,
  getClient,
  getClientExistsByPhone,
  getClientIdByPhone,
  readAllClientAppointments,
  readAllOwnerAppointments,
  readAllOwnerAppointmentsInDate,
  readAllOwnerFutureAppointments,
  readAllServices,
  readAppointment,
  readBusiness,
  readOwenerIdFromServiceId,
  readSingleService,
  readWeeklySchedule,
  readWorkWeedId,
  updateAppointment,
  updateBusiness,
  updateClient,
  updateDailySchedule,
  updateService,
} from './database.js';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import { addDayToDate } from './helperFunctions.js';

const app = express();
app.use(express.json());
app.use(cors());

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

//-- Users --
//Create new user
app.post(
  '/users/create-user',
  [
    check('fullname').notEmpty().withMessage('Full name cannot be empty'),
    check('email').isEmail().withMessage('Invalid email'),
    check('id').notEmpty().withMessage('Id cannot be empty'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('expess- password sould be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const { id, fullname, email, password } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // return res.status(400).json({ error: errors.array() });
        // return res.status(400).send('eytan4000');
        return res.status(400).send(errors.array()[0].msg);
      }

      const result = await createUser(id, fullname, email);

      if (result.affectedRows === 1) {
        res.status(201).send('User created successfully');
        console.log('User created successfully');
      } else {
        res.status(500).send('User creation failed');
        console.log('User creation failed');
      }
    } catch (err) {
      console.error(err);
      // res.status(500).send('Server error');
      res.status(500).send(err.sqlMessage);
      // console.log(err.sqlMessage);
    }
  }
);

app.get('/users/change-user-temp-id/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // // Validate the request data
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ error: errors.array() });
    // }

    const result = await changeUserTempId(uid);

    if (result.affectedRows === 1) {
      res.status(201).send('User id updated successfully');
      console.log('User id updated successfully');
    } else {
      res.status(500).send('User id update failed');
      console.log('User id update failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// google auth:
//Create new user
app.post(
  '/users/create-google-user',
  [
    check('fullname').notEmpty().withMessage('Full name cannot be empty'),
    check('email').isEmail().withMessage('Invalid email'),
    check('id').notEmpty().withMessage('Id cannot be empty'),
  ],
  async (req, res) => {
    try {
      const { id, fullname, email } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // return res.status(400).json({ error: errors.array() });
        // return res.status(400).send('eytan4000');
        return res.status(400).send(errors.array()[0].msg);
      }

      const result = await createUser(id, fullname, email);

      if (result.affectedRows === 1) {
        res.status(201).send('User created successfully');
        console.log('User created successfully');
      } else {
        res.status(500).send('User creation failed');
        console.log('User creation failed');
      }
    } catch (err) {
      console.error(err);
      // res.status(500).send('Server error');
      res.status(500).send(err.sqlMessage);
      // console.log(err.sqlMessage);
    }
  }
);

//-- Services --

// Create new service
app.post(
  '/services/create-service',
  [
    check('name').notEmpty().withMessage('Service name cannot be empty'),
    check('owner_id').notEmpty().withMessage('Owner id cannot be empty'),
  ],
  async (req, res) => {
    try {
      const { name, description, duration, price, owner_id, img_url } =
        req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await createService(
        name,
        description,
        duration,
        price,
        owner_id,
        img_url
      );

      if (result.affectedRows === 1) {
        // res.status(201).send('Service created successfully');
        const allServices = await readAllServices(owner_id);
        res.status(201).json(allServices);
      } else {
        res.status(500).send('Service creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Read all owner's services by owner_id

app.get('/services/read-all-services/:owner_id', async (req, res) => {
  console.log('Read all services');
  // await wait(1000);
  try {
    const owner_id = req.params.owner_id;

    const result = await readAllServices(owner_id);

    if (result.length >= 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Services reading failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read single service by service_id

app.get('/services/read-single-service/:service_id', async (req, res) => {
  console.log('Read single service');
  await wait(1000);
  try {
    const service_id = req.params.service_id;

    const result = await readSingleService(service_id);
    // throw error;
    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Services reading failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update service by service_id
app.post(
  '/services/update-service',
  [
    // check('name').notEmpty().withMessage('Service name cannot be empty'),
    check('service_id').notEmpty().withMessage('Service id cannot be empty'),
  ],
  async (req, res) => {
    console.log('update service');

    await wait(1000);

    try {
      const {
        name = null,
        description = null,
        duration = null,
        price = null,
        service_id,
        owner_id,
        img_url = null,
      } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await updateService(
        name,
        description,
        duration,
        price,
        service_id,
        img_url
      );

      if (result.affectedRows === 1) {
        // res.status(201).send('Service created successfully');
        const allServices = await readAllServices(owner_id);
        res.status(201).json(allServices);
      } else {
        res.status(500).send('Service creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Delete service by service_id
app.delete('/services/:service_id', async (req, res) => {
  try {
    const { service_id } = req.params;

    //   Validate the request data

    if (!service_id) {
      return res.status(400).send('No service id to delete');
    }
    const owner_id = await readOwenerIdFromServiceId(service_id); // get owner_id before deleting, to send back the total array of services.
    const result = await deleteService(service_id);

    if (result.affectedRows === 1) {
      // res.status(201).send('Service deleted successfully');
      const allServices = await readAllServices(owner_id);
      res.status(201).json(allServices);
    } else {
      res.status(500).send('Service deleting failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//-- WorkWeek --

// Create new workWeek
app.post(
  '/workweek/create-workweek',
  [check('owner_id').notEmpty().withMessage('Owner id cannot be empty')],
  async (req, res) => {
    try {
      const { owner_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await createWorkWeek(owner_id);

      if (result.affectedRows === 1) {
        res.status(201).json({ workweekId: result.insertId });
      } else {
        res.status(500).send('WorkWeek creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// // Create new dailySchedule
// app.post(
//   '/dailySchedule/create-daily-schedule',
//   [check('workweek_id').notEmpty().withMessage('workweek_id cannot be empty')],
//   async (req, res) => {
//     try {
//       const { i, workweek_id } = req.body;

//       // Validate the request data
//       const errors = validationResult(req);

//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: errors.array() });
//       }

//       const result = await createDailySchedule(i, workweek_id);

//       if (result.affectedRows === 1) {
//         res.status(201).send('WorkWeek created successfully');
//       } else {
//         res.status(500).send('WorkWeek creation failed');
//       }
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Server error');
//     }
//   }
// );

//create 7 daily schedules
app.post(
  '/dailySchedule/create-7-daily-schedules',
  [check('workweek_id').notEmpty().withMessage('workweek_id cannot be empty')],
  async (req, res) => {
    await wait(1000);
    try {
      const { weekScheduleObj } = req.body;
      const { workweek_id } = weekScheduleObj;

      // // Validate the request data
      // const errors = validationResult(req);

      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ error: errors.array() });
      // }

      const weekDaysArray = Object.values(weekScheduleObj); //object to arr for map

      //this creates a daily schedule for each arr obj and returns all the
      const resultArr = await Promise.all(
        weekDaysArray.map(async (weekDay) => {
          if (typeof weekDay === 'number') return; // checks if the array object is the workweek_id
          const result = await createDailySchedule(
            weekDay.name,
            weekDay.startTime,
            weekDay.endTime,
            workweek_id,
            weekDay.isWorkDay,
            weekDay.timeSlotDuration
          );
          return result.insertId;
        })
      );

      if (resultArr.length > 0) {
        res.status(201).send('WorkWeek created successfully');
        // res.status(201).json(resultArr);
      } else {
        res.status(500).send('WorkWeek creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// // Read WorkWeek based on owner_id
// app.post(
//   '/workweek/read-workweek',
//   [check('owner_id').notEmpty().withMessage('Owner_id cannot be empty')],
//   async (req, res) => {
//     try {
//       const { owner_id } = req.body;

//       // Validate the request data
//       const errors = validationResult(req);

//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: errors.array() });
//       }

//       const result = await getWorkWeekIdForOwnerId(owner_id);

//       if (result.length > 0) {
//         res.status(201).json(result[0]);
//       } else {
//         res.status(500).send('WorkWeek id read failed');
//       }
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Server error');
//     }
//   }
// );

// Read workWeek_id based on owner_id
app.get('/workweek/read-workweek-id/:owner_id', async (req, res) => {
  // await wait(1e3);
  try {
    const { owner_id } = req.params;
    // Validate the request data
    const errors = validationResult(req);

    if (owner_id.trim === '') {
      return res.status(400).json({ error: errors.array() });
    }

    const result = await readWorkWeedId(owner_id);

    if (result.length > 0) {
      res.status(201).json(result[0].id);
    } else {
      res.status(500).send('Owner id read failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read weekly schedule based on workweek_id
app.get(
  '/dailySchedule/read-weekly-schedule/:workweek_id',
  async (req, res) => {
    try {
      const { workweek_id } = req.params;

      // Validate the request data
      const errors = validationResult(req);
      if (workweek_id.trim === '') {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await readWeeklySchedule(workweek_id);

      if (result.length > 0) {
        res.status(201).json(result);
      } else {
        res.status(500).send('WorkWeek id read failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Update dailySchedule by workWeek_id AND day_of_week
app.post(
  '/dailySchedule/update-changed-daily-schedules',
  // [check('start_time').withMessage('Start time cannot be empty')],
  // [check('end_time').notEmpty().withMessage('End time cannot be empty')],
  // [check('workWeek_id').notEmpty().withMessage('workweek_id cannot be empty')],
  // [check('day_of_week').notEmpty().withMessage('Day of week cannot be empty')],
  async (req, res) => {
    try {
      const { changedArr } = req.body;

      // // Validate the request data
      // const errors = validationResult(req);

      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ error: errors.array() });
      // }

      const resultArr = await Promise.all(
        changedArr.map(async (weekDay) => {
          const result = await updateDailySchedule(
            weekDay.start_time,
            weekDay.endTime,
            weekDay.isWorkDay,
            weekDay.timeSlotDuration,
            weekDay.id
          );
          return result.insertId;
        })
      );

      if (resultArr) {
        res.status(201).send('Daily schedule updated successfully');
      } else {
        res.status(500).send('Daily schedule update failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// --Clients--

// Create new client:
app.post(
  '/clients/create-client',
  [
    check('name').notEmpty().withMessage('Name cannot be empty'),
    check('phone').notEmpty().withMessage('Phone cannot be empty'),
    // check('email').isEmail().withMessage('Invalid email'),
    check('owner_id').notEmpty().withMessage('Owner id cannot be empty'),
  ],
  async (req, res) => {
    await wait(2000);
    try {
      const { name, phone, email, owner_id } = req.body;

      console.log(name, phone, email, owner_id);

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await createClient(name, phone, email, owner_id);

      if (result.affectedRows === 1) {
        res.status(201).json(result.insertId);
      } else {
        res.status(500).send('Client creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Update client by client_id:
app.post(
  '/clients/update-client',
  [check('client_id').notEmpty().withMessage('Client id cannot be empty')],
  async (req, res) => {
    await wait(1000);
    try {
      const { name, phone, email, client_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await updateClient(name, phone, email, client_id);

      if (result.affectedRows === 1) {
        res.status(201).send('Client updated successfully');
      } else {
        res.status(500).send('Client update failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Delete Client by client_id
app.delete('/clients/delete-client/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;

    //   Validate the request data

    if (!client_id) {
      return res.status(400).send('No service id to delete');
    }

    const result = await deleteClient(client_id);

    if (result.affectedRows === 1) {
      res.status(201).send('Client deleted successfully');
    } else {
      res.status(500).send('Client deleting failed');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read all owner's clients
app.get('/clients/get-all-clients/:owner_id', async (req, res) => {
  // await wait(1000);
  try {
    const { owner_id } = req.params;

    // Validate the request data

    const result = await getAllOwnerClients(owner_id);

    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Cannot fetch appointment');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read single blient by client_id
app.get('/clients/get-client/:client_id', async (req, res) => {
  await wait(1000);
  try {
    const { client_id } = req.params;

    // Validate the request data

    const result = await getClient(client_id);

    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Cannot fetch appointment');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read single client for owner by phone
app.get('/clients/get-client-exists-by-phone/', async (req, res) => {
  // await wait(1000);
  try {
    // const { phone } = req.params;

    const phone = req.query.phone;
    const owner_id = req.query.owner_id;

    // Validate the request data

    const result = await getClientExistsByPhone(phone, owner_id);

    if (result.length > 0) {
      res.status(201).json(result[0]);
    } else {
      res.status(500).send('Cannot execute query');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read clientId by Phone
app.get('/clients/get-client-id-by-phone/', async (req, res) => {
  // await wait(1000);
  console.log('asdfasdf');

  try {
    // const { phone } = req.params;

    const phone = req.query.phone;
    const owner_id = req.query.owner_id;

    // Validate the request data

    const result = await getClientIdByPhone(phone, owner_id);

    if (result.length > 0) {
      res.status(201).json(result[0].id);
    } else {
      res.status(500).send('Cannot execute query');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//--Appointments--

// Create new appointment:
app.post(
  '/appointments/create-appointment',
  [check('owner_id').notEmpty().withMessage('Owner id cannot be empty')],
  [check('client_id').notEmpty().withMessage('Client id cannot be empty')],
  [check('service_id').notEmpty().withMessage('Service id cannot be empty')],
  async (req, res) => {
    await wait(1000);
    try {
      const { owner_id, client_id, start, end, date, service_id, note } =
        req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await createAppointment(
        owner_id,
        client_id,
        start,
        end,
        date,
        service_id,
        note
      );
      // console.log(result.insertId);

      if (result.affectedRows === 1) {
        res.status(201).json(result.insertId);
      } else {
        res.status(500).send('Appointment creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Read single appointment:
app.get('/appointments/get-appointment/:appointment_id', async (req, res) => {
  try {
    const { appointment_id } = req.params;

    // Validate the request data

    const result = await readAppointment(appointment_id);

    if (result.length > 0) {
      res.status(201).json(result);
    } else {
      res.status(500).send('Cannot fetch appointment');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Read all appointments by owner_id:
app.get(
  '/appointments/get-all-owner-appointments/:owner_id',
  async (req, res) => {
    try {
      const { owner_id } = req.params;

      // Validate the request data

      const result = await readAllOwnerAppointments(owner_id);

      if (result.length > 0) {
        res.status(201).json(result);
      } else {
        res.status(500).send('Cannot fetch appointments');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Read all Future appointments by owner_id:
app.get(
  '/appointments/get-all-future-appointments/:owner_id',
  async (req, res) => {
    try {
      const { owner_id } = req.params;
      console.log(owner_id);

      // Validate the request data

      const result = await readAllOwnerFutureAppointments(owner_id);

      console.log(result);

      const resultWithAddedDay = result.map((res) => ({
        ...res,
        date: addDayToDate(res.date),
      })); //returns minus 1 day (why?)

      console.log(resultWithAddedDay);

      if (result.length >= 0) {
        res.status(201).json(resultWithAddedDay);
      } else {
        res.status(500).send('Cannot fetch appointments');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Read all appointments by client_id:
app.get(
  '/appointments/get-all-client-appointments/:client_id',
  async (req, res) => {
    try {
      const { client_id } = req.params;

      // Validate the request data

      const result = await readAllClientAppointments(client_id);

      if (result.length > 0) {
        res.status(201).json(result);
      } else {
        res.status(500).send('Cannot fetch appointments');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);
// Update appointment:

app.post(
  '/appointments/update-appointment',
  [
    check('appointment_id')
      .notEmpty()
      .withMessage('Appointment id cannot be empty'),
  ],
  async (req, res) => {
    await wait(1000);
    try {
      const { start, end, serviceId, note, date, appointment_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await updateAppointment(
        start,
        end,
        serviceId,
        note,
        date,
        appointment_id
      );

      if (result.affectedRows === 1) {
        res.status(201).send('Appointment updated successfully');
      } else {
        res.status(500).send('Appointment update failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Delete appointment:
// deleteAppointment(appointment_id)
app.delete(
  '/appointments/delete-appointment/:appointment_id',
  async (req, res) => {
    try {
      const { appointment_id } = req.params;

      const result = await deleteAppointment(appointment_id);

      if (result.affectedRows === 1) {
        res.status(201).send('Appointment deleted successfully');
      } else {
        res.status(500).send('Appointment deleting failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// check if new appointment overlaps existing one before summary
app.post(
  '/appointments/check-overlap',
  [
    check('start').notEmpty().withMessage('Start time cannot be empty'),
    check('end').notEmpty().withMessage('End time cannot be empty'),
    check('date').notEmpty().withMessage('End time cannot be empty'),
    check('owner_id').notEmpty().withMessage('owner_id cannot be empty'),
  ],
  async (req, res) => {
    // await wait(1000);

    try {
      const { start, end, date, owner_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const overlappingAppointment = await checkOverlaps(
        owner_id,
        date,
        start,
        end
      );

      if (overlappingAppointment.length === 0) {
        res.status(201).send('Not overlapping');
      } else {
        res.status(201).send('Overlapping');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// -----business -----------

// Create new appointment:
app.post(
  '/business/create-business',
  [check('owner_id').notEmpty().withMessage('Owner id cannot be empty')],
  async (req, res) => {
    await wait(1000);
    try {
      const { owner_id, name, address, phone } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await createBusiness(owner_id, name, address, phone);

      if (result.affectedRows === 1) {
        res.status(201).json(result.insertId);
      } else {
        res.status(500).send('Appointment creation failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// Update business:
app.post(
  '/business/update-business',
  [check('owner_id').notEmpty().withMessage('Business id cannot be empty')],
  async (req, res) => {
    try {
      const { name, address, phone, owner_id } = req.body;

      // Validate the request data
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const result = await updateBusiness(name, address, phone, owner_id);

      if (result.affectedRows === 1) {
        res.status(201).send('Business updated successfully');
      } else {
        res.status(500).send('Business update failed');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);
// Read single appointment:
app.get('/business/get-business/:owner_id', async (req, res) => {
  await wait(1000);

  try {
    const { owner_id } = req.params;

    // Validate the request data

    const result = await readBusiness(owner_id);

    if (result.length > 0) {
      res.status(201).json(result[0]);
    } else {
      res.status(500).send('Cannot fetch business');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8090, () => {
  console.log('server is running on port 8090');
});
