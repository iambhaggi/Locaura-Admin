const { createSupportTicketModel } = require('../models/SupportTicket');

exports.getAllTickets = async (req, res) => {
  try {
    const SupportTicket = await createSupportTicketModel();
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { ticketNumber: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') }
      ];
    }
    if (status) {
      query.status = status;
    }

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await SupportTicket.countDocuments(query);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const SupportTicket = await createSupportTicketModel();
    const ticket = await SupportTicket.findById(req.params.id).lean();
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const SupportTicket = await createSupportTicketModel();
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).lean();

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket status updated', data: ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const SupportTicket = await createSupportTicketModel();
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.assignedTo },
      { new: true }
    ).lean();

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket assigned', data: ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
