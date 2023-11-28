import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

//-- Users --
//Create new user
export async function createUser(id, fullname, email) {
  const [rows] = await pool.query(
    'INSERT INTO users (id, fullname, email) VALUES (?, ?, ?)',
    [id, fullname, email]
  );

  return rows;
}
export async function changeUserTempId(uid) {
  const temporalUidstr = 'temp';

  const [rows] = await pool.query(
    `UPDATE users
    SET id = ?
    WHERE id = '${temporalUidstr}';`,
    [uid]
  );

  return rows;
}

//-- Services --

// Create new service
export async function createService(
  name,
  description,
  duration,
  price,
  owner_id,
  img_url
) {
  const [rows] = await pool.query(
    'INSERT INTO services (name, description, duration, price, owner_id, img_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, duration, price, owner_id, img_url]
  );

  return rows;
}

// Read all services
export async function readAllServices(owner_id) {
  const [rows] = await pool.query('SELECT * FROM services where owner_id=?;', [
    owner_id,
  ]);

  return rows;
}

// Read single service
export async function readSingleService(service_id) {
  const [rows] = await pool.query('SELECT * FROM services WHERE id=?', [
    service_id,
  ]);

  return rows;
}

// Update service by service_id
export async function updateService(
  name,
  description,
  duration,
  price,
  service_id,
  img_url
) {
  const [rows] = await pool.query(
    `UPDATE services
     SET 
      name = CASE WHEN ? IS NOT NULL THEN ? ELSE name END, 
      description = CASE WHEN ? IS NOT NULL THEN ? ELSE description END, 
      duration = CASE WHEN ? IS NOT NULL THEN ? ELSE duration END, 
      price = CASE WHEN ? IS NOT NULL THEN ? ELSE price END,
      img_url = CASE WHEN ? IS NOT NULL THEN ? ELSE img_url END 
     WHERE id = ?;`,
    [
      name,
      name,
      description,
      description,
      duration,
      duration,
      price,
      price,
      img_url,
      img_url,
      service_id,
    ]
  );
  return rows;
}

// read owner_id for service_id
export async function readOwenerIdFromServiceId(service_id) {
  const [rows] = await pool.query('SELECT owner_id FROM services WHERE id=?', [
    service_id,
  ]);

  return rows[0].owner_id;
}

// Delete service by service_id
export async function deleteService(service_id) {
  const [rows] = await pool.query(`DELETE FROM services WHERE id=?;`, [
    service_id,
  ]);
  return rows;
}

// --Workweek --
// Create new workWeek by owner_id
export async function createWorkWeek(owner_id) {
  const [rows] = await pool.query(
    `INSERT INTO workWeek (owner_id) VALUES (?);`,
    [owner_id]
  );
  return rows;
}

// Create new dailySchedule
export async function createDailySchedule(
  day,
  startTime,
  endTime,
  workweek_id,
  isWorkDay,
  timeSlotDuration
) {
  const [rows] = await pool.query(
    `INSERT INTO dailySchedule (day_of_week, start_time, end_time, workweek_id, is_workDay, time_slot_duration)
  VALUES
      (? , ?, ?, ?,?, ?);`,
    [day, startTime, endTime, workweek_id, isWorkDay, timeSlotDuration]
  );
  return rows;
}

// Read weekly schedule based on workweek_id
export async function readWeeklySchedule(workWeek_id) {
  const [rows] = await pool.query(
    `SELECT * FROM dailySchedule WHERE workWeek_id=?;`,
    [workWeek_id]
  );
  return rows;
}

// Select workweek_id from owner_id
export async function readWorkWeedId(owner_id) {
  const [rows] = await pool.query(`SELECT id FROM workWeek WHERE owner_id=?`, [
    owner_id,
  ]);
  return rows;
}

// Update dailySchedule by dailySchedule_id
export async function updateDailySchedule(
  start_time,
  end_time,
  isWorkDay,
  timeSlotDuration,
  dailySchedule_id
) {
  const [rows] = await pool.query(
    `UPDATE dailySchedule
      SET
        start_time = ?,
        end_time = ?,
        is_workDay = ?,
        time_slot_duration = ?
      WHERE id = ?;`,

    [start_time, end_time, isWorkDay, timeSlotDuration, dailySchedule_id]
  );
  return rows;
}

// --Clients--

// Create new client:
export async function createClient(name, phone, email, owner_id) {
  const [rows] = await pool.query(
    `INSERT INTO clients (name, phone, email, owner_id) 
            VALUES (?, ?, ?, ?);`,
    [name, phone, email, owner_id]
  );

  return rows;
}

// Update client by client_id:
export async function updateClient(name, phone, email, client_id) {
  const [rows] = await pool.query(
    `UPDATE clients
        SET
          Name = CASE WHEN ? IS NOT NULL THEN ? ELSE Name END,
          phone = CASE WHEN ? IS NOT NULL THEN ? ELSE phone END,
          email = CASE WHEN ? IS NOT NULL THEN ? ELSE email END
        WHERE id = ? ;`,
    [name, name, phone, phone, email, email, client_id]
  );
  return rows;
}

// Delete client
export async function deleteClient(client_id) {
  const [rows] = await pool.query(`DELETE FROM clients WHERE id = ?;`, [
    client_id,
  ]);
  return rows;
}

// read all owners clinet
export async function getAllOwnerClients(owner_id) {
  const [rows] = await pool.query(`SELECT * FROM clients WHERE owner_id = ?;`, [
    owner_id,
  ]);
  return rows;
}
// read client by client_id
export async function getClient(client_id) {
  const [rows] = await pool.query(`SELECT * FROM clients WHERE id = ?;`, [
    client_id,
  ]);
  return rows;
}
// Check if client exists by phone
export async function getClientExistsByPhone(phone, owner_id) {
  // 0508657032
  const [rows] = await pool.query(
    `SELECT EXISTS (SELECT 1 FROM clients WHERE phone = ? && owner_id = ?) AS existsValue;`,
    [phone, owner_id]
  );
  return rows;
}

// Get client id by phone
export async function getClientIdByPhone(phone, owner_id) {
  // 0508657032
  const [rows] = await pool.query(
    `SELECT * FROM clients WHERE phone = ? && owner_id = ?`,
    [phone, owner_id]
  );
  return rows;
}

//--Appointments

// Create new appointment:
export async function createAppointment(
  owner_id,
  client_id,
  start,
  end,
  date,
  service_id,
  note
) {
  const [rows] = await pool.query(
    `INSERT INTO appointments (owner_id, client_id, start, end,date, service_id, note) 
            VALUES (?,?,?,?,?,?,?);`,
    [owner_id, client_id, start, end, date, service_id, note]
  );
  return rows;
}

// Read single appointment:
export async function readAppointment(appointment_id) {
  const [rows] = await pool.query(`SELECT * FROM appointments WHERE id=?;`, [
    appointment_id,
  ]);
  return rows;
}

// Read all appointments by owner_id:
export async function readAllOwnerAppointments(owner_id) {
  const [rows] = await pool.query(
    `SELECT * FROM appointments WHERE owner_id=?`,
    [owner_id]
  );
  return rows;
}

// Read all future appointments by owner_id:
export async function readAllOwnerFutureAppointments(owner_id) {
  const [rows] = await pool.query(
    `SELECT * FROM appointments WHERE owner_id=? AND date >= CURDATE();`,
    [owner_id]
  );
  return rows;
}

// Read all future appointments by owner_id of spesific date:
export async function readAllOwnerAppointmentsInDate(owner_id, date) {
  const [rows] = await pool.query(
    `SELECT * FROM appointments WHERE owner_id=? AND date =?;`,
    [owner_id, date]
  );
  return rows;
}

// check for overlaps
export async function checkOverlaps(
  owner_id,
  date,
  appointmentStart,
  appointmentEnd
) {
  const [rows] = await pool.query(
    `SELECT *
    FROM appointments
    WHERE owner_id = ?
      AND (
        (start < ? AND end > ? AND date = ?)
        OR
        (start < ? AND end > ? AND date = ?)
        OR
        (start > ? AND end < ? AND date = ?)
      );
    `,
    [
      owner_id,

      appointmentEnd,
      appointmentStart,
      date,

      appointmentEnd,
      appointmentStart,
      date,

      appointmentStart,
      appointmentEnd,
      date,
    ]
  );
  return rows;
}

// console.log(await checkOverlaps(
//   'nbl4kT3L2pNLEcZ1W4zQAzfcUsA3',
//   '2023-11-28',
//   '14:30',
//   '16:30'
// ));

// Read all appointments by client_id:
export async function readAllClientAppointments(client_id) {
  const [rows] = await pool.query(
    `SELECT * FROM appointments WHERE client_id=?`,
    [client_id]
  );
  return rows;
}

// Update appointment:
export async function updateAppointment(
  start,
  end,
  service_id,
  note,
  date,
  appointment_id
) {
  const [rows] = await pool.query(
    `UPDATE appointments
    SET
      start = CASE WHEN ? IS NOT NULL THEN ? ELSE start END,
      end = CASE WHEN ? IS NOT NULL THEN ? ELSE end END,
      service_id = CASE WHEN ? IS NOT NULL THEN ? ELSE service_id END,
      date = CASE WHEN ? IS NOT NULL THEN ? ELSE date END,
      note = CASE WHEN ? IS NOT NULL THEN ? ELSE note END
    WHERE id = ? ;`,
    [
      start,
      start,
      end,
      end,
      service_id,
      service_id,
      date,
      date,
      note,
      note,
      appointment_id,
    ]
  );
  return rows;
}

// Delete appointment:
export async function deleteAppointment(appointment_id) {
  const [rows] = await pool.query(`DELETE FROM appointments WHERE id=?;`, [
    appointment_id,
  ]);
  return rows;
}

// -- business --

// Create new business:
export async function createBusiness(owner_id, name, address, phone) {
  const [rows] = await pool.query(
    `INSERT INTO business (owner_id, name, address, phone) 
            VALUES (?,?,?,?);`,
    [owner_id, name, address, phone]
  );
  return rows;
}

// Read business:
export async function readBusiness(owner_id) {
  const [rows] = await pool.query(`SELECT * FROM business WHERE owner_id=?;`, [
    owner_id,
  ]);
  return rows;
}

// Update business:
export async function updateBusiness(name, address, phone, owner_id) {
  const [rows] = await pool.query(
    `UPDATE business
    SET
    name = ?,
    address = ?,
    phone = ?
    WHERE owner_id = ? ;`,
    [name, address, phone, owner_id]
  );
  return rows;
}
