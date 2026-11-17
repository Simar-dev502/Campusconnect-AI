
const Application = require('../models/Application');
const Project = require('../models/Project');
const createNotification = require('../utils/createNotification');
// APPLY FOR A PROJECT
const applyForProject = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please write an application message'
      });
    }

    const project = await Project.findById(req.params.projectId);

    if (!project || !project.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This project is not accepting applications'
      });
    }

    if (project.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own project'
      });
    }

    const alreadyMember = project.teamMembers.some(
      member => member.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project'
      });
    }

    const existingApplication = await Application.findOne({
      project: project._id,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this project'
      });
    }

    const application = await Application.create({
      project: project._id,
      applicant: req.user._id,
      message: message.trim()
    });
    await createNotification({
  recipient: project.owner,
  sender: req.user._id,
  type: 'application',
  title: 'New Project Application',
  message: `${req.user.name} applied for your project "${project.title}".`,
  relatedId: application._id
});

    const populatedApplication = await Application.findById(application._id)
      .populate('applicant', 'name college branch profilePhoto skills')
      .populate('project', 'title owner');

    res.status(201).json({
      success: true,
      message: 'Project application submitted successfully',
      application: populatedApplication
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this project'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Unable to submit application'
    });
  }
};

// GET MY APPLICATIONS
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user._id
    })
      .populate('project', 'title description category status owner')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch your applications'
    });
  }
};

// GET APPLICATIONS FOR A PROJECT (OWNER ONLY)
const getProjectApplications = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can view applications'
      });
    }

    const applications = await Application.find({
      project: project._id
    })
      .populate('applicant', 'name college branch profilePhoto skills interests')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch project applications'
    });
  }
};

// ACCEPT OR REJECT APPLICATION (OWNER ONLY)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be accepted or rejected'
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const project = await Project.findById(application.project);

    if (!project || !project.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can review applications'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This application has already been reviewed'
      });
    }

    if (status === 'accepted') {
      // Owner is already included in teamMembers.
      const maximumTeamSize = project.positions + 1;

      if (project.teamMembers.length >= maximumTeamSize) {
        return res.status(400).json({
          success: false,
          message: 'All project positions are filled'
        });
      }

      project.teamMembers.addToSet(application.applicant);
      await project.save();

      // Close the project when all positions are filled.
      if (project.teamMembers.length >= maximumTeamSize) {
        project.status = 'in-progress';
        await project.save();
      }
    }

    application.status = status;
    await application.save();

await createNotification({
  recipient: application.applicant,
  sender: req.user._id,
  type: 'application',
  title: status === 'accepted'
    ? 'Application Accepted!'
    : 'Application Rejected',
  message: status === 'accepted'
    ? `Your application for "${project.title}" has been accepted!`
    : `Your application for "${project.title}" was not accepted.`,
  relatedId: application._id
});


    const populatedApplication = await Application.findById(application._id)
      .populate('applicant', 'name college profilePhoto')
      .populate('project', 'title status');

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      application: populatedApplication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to update application'
    });
  }
};

module.exports = {
  applyForProject,
  getMyApplications,
  getProjectApplications,
  updateApplicationStatus
};
