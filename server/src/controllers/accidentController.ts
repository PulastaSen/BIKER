import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import AccidentReport from '../models/AccidentReport.js';
import { mockStore } from '../services/mockStore.js';

function generateReportId() {
  return `ACC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export const createAccidentReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || req.body.userId || 'user-rider-1';
    const {
      bikeId,
      location,
      riderSafe,
      injuriesReported,
      emergencyServicesContacted,
      photos,
      bikeDamage,
      otherVehicles,
      witnessInfo,
      roadCondition,
      insuranceClaimStarted,
      insurancePolicyNumber,
      towingRequested,
      notes
    } = req.body;

    const reportId = generateReportId();
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const mockReport = mockStore.createAccidentReport({
        reportId,
        userId,
        bikeId,
        incidentTime: new Date().toISOString(),
        location: {
          coordinates: location?.coordinates || [88.3953, 26.7271],
          address: location?.address || 'Siliguri Highway'
        },
        riderSafe: riderSafe !== false,
        injuriesReported: !!injuriesReported,
        emergencyServicesContacted: !!emergencyServicesContacted,
        photos: photos || [],
        bikeDamage: bikeDamage || 'Front fork and headlight scratch',
        otherVehicles: otherVehicles || 'None',
        witnessInfo: witnessInfo || 'None',
        roadCondition: roadCondition || 'Wet road',
        insuranceClaimStarted: !!insuranceClaimStarted,
        insurancePolicyNumber,
        towingRequested: !!towingRequested,
        notes,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString()
      });

      res.status(201).json({ success: true, data: mockReport });
      return;
    }

    const report = new AccidentReport({
      reportId,
      userId,
      bikeId,
      location: {
        type: 'Point',
        coordinates: location?.coordinates || [88.3953, 26.7271],
        address: location?.address
      },
      riderSafe: riderSafe !== false,
      injuriesReported: !!injuriesReported,
      emergencyServicesContacted: !!emergencyServicesContacted,
      photos: photos || [],
      bikeDamage: bikeDamage || 'Damage documented',
      otherVehicles: otherVehicles || 'None',
      witnessInfo: witnessInfo || 'None',
      roadCondition: roadCondition || 'Normal',
      insuranceClaimStarted: !!insuranceClaimStarted,
      insurancePolicyNumber,
      towingRequested: !!towingRequested,
      notes,
      status: 'SUBMITTED'
    });

    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating accident report:', error);
    res.status(500).json({ success: false, message: 'Failed to record accident report' });
  }
};

export const getAccidentReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || 'user-rider-1';
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      const reports = mockStore.getAccidentReports(userId);
      res.status(200).json({ success: true, data: reports });
      return;
    }

    const reports = await AccidentReport.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error('Error retrieving accident reports:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve reports' });
  }
};
