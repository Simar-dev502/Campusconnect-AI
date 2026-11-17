
const Project = require('../models/Project');
const Application = require('../models/Application');

// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      positions,
      deadline
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project title and description are required'
      });
    }

    const project = await Project.create({
      owner: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category || 'Other',
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      positions: positions || 1,
      deadline: deadline || null,
      teamMembers: [req.user._id]
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name college branch profilePhoto skills')
      .populate('teamMembers', 'name college profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Unable to create project',
      error: error.message
    });
  }
};

// GET ALL PROJECTS
const getProjects = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = { $in: ['open', 'in-progress'] };
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.skill) {
      filter.requiredSkills = {
        $regex: req.query.skill,
        $options: 'i'
      };
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .populate('owner', 'name college branch profilePhoto')
      .populate('teamMembers', 'name college profilePhoto')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch projects'
    });
  }
};

// GET SINGLE PROJECT
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('owner', 'name college branch profilePhoto skills')
      .populate('teamMembers', 'name college profilePhoto');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid project ID'
    });
  }
};

// GET MY PROJECTS
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.user._id,
      isActive: true
    })
      .populate('teamMembers', 'name college profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch your projects'
    });
  }
};

// UPDATE MY PROJECT
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project || !project.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can update it'
      });
    }

    const allowedFields = [
      'title',
      'description',
      'category',
      'requiredSkills',
      'positions',
      'deadline',
      'status'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Unable to update project',
      error: error.message
    });
  }
};

// DELETE MY PROJECT
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (
      project.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete this project'
      });
    }

    await Application.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and related applications deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to delete project'
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  getMyProjects,
  updateProject,
  deleteProject
};
